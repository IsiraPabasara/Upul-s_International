import { Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import redis from "../../../../packages/libs/redis";
import md5 from "md5";
import {
  sendOrderConfirmation,
  sendShopNewOrderNotification,
} from "../email-service/email.service";

export const handlePayHereNotify = async (req: Request, res: Response) => {
  // PayHere sends data as FORM DATA (x-www-form-urlencoded).
  // Ensure your Express app has:
  // app.use(express.urlencoded({ extended: true }));
  // (and if you also accept JSON somewhere else: app.use(express.json());)

  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const lockKey = `payhere_lock:${order_id}`;

  try {
    // 🔐 1) REDIS LOCK (Idempotency)
    const acquiredLock = await redis.set(lockKey, "processing", "EX", 30, "NX");
    if (!acquiredLock) {
      console.log(`⚠️ Duplicate webhook ignored for Order #${order_id}`);
      return res.status(200).send("Ignored: Duplicate Request");
    }

    // 🔐 2) VERIFY SIGNATURE (Anti-Tamper)
    const secret = process.env.PAYHERE_SECRET!;
    const hashedSecret = md5(secret).toUpperCase();

    const localHash = md5(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        hashedSecret
    ).toUpperCase();

    if (localHash !== md5sig) {
      console.error(`⛔ Invalid Signature for Order #${order_id}`);
      return res.status(400).send("Security Error: Invalid Signature");
    }

    // 🔄 3) FETCH ORDER
    // order_id is your custom orderNumber string
    const order = await prisma.order.findUnique({
      where: { orderNumber: order_id },
    });

    if (!order) return res.status(404).send("Order not found");

    // 🛑 4) STATUS CHECK (Double Idempotency)
    if (order.status !== "PENDING") {
      return res.status(200).send("Already Processed");
    }

    // ============================================================
    // ✅ SCENARIO 1: PAYMENT SUCCESS
    // ============================================================
    if (status_code === "2") {
      await prisma.$transaction(async (tx) => {
        // 1) Update Order Status
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CONFIRMED",
            paymentMethod: "PAYHERE",
            trackingNumber: payment_id, // Save PayHere payment ID
          },
        });

        // 2) Clear User's Cart (moved here)
        if (order.userId) {
          await tx.cart.update({
            where: { userId: order.userId },
            data: { items: [] },
          });
        }
      });

      // Send Emails (fire-and-forget)
      sendOrderConfirmation(order).catch(console.error);
      sendShopNewOrderNotification(order).catch(console.error);

      console.log(`✅ Payment Success for Order #${order_id}`);
      return res.status(200).send("OK");
    }

    // ============================================================
    // ❌ SCENARIO 2: PAYMENT FAILED / CANCELLED
    // ============================================================
    console.log(`❌ Payment Failed for Order #${order_id}. Restoring Stock...`);

    await prisma.$transaction(async (tx) => {
      // 1) Mark Order as Cancelled
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });

      // 2) Restore Stock (because stock was deducted at order creation)
      const items = order.items as any[]; // JSON -> array

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        if (item.size) {
          // Restore Variant Stock
          const currentVariants = (product.variants as any[]) || [];
          const newVariants = currentVariants.map((v: any) => {
            if (v.size === item.size) {
              return { ...v, stock: (v.stock || 0) + item.quantity };
            }
            return v;
          });

          await tx.product.update({
            where: { id: item.productId },
            data: { variants: newVariants },
          });
        } else {
          // Restore Standard Stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PayHere Webhook Error:", error);
    return res.status(500).send("Server Error");
  } finally {
    // Always release lock
    await redis.del(lockKey);
  }
};
import { Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma"; // Adjust path
import redis from "../../../../packages/libs/redis"; // Adjust path to your Redis instance
import md5 from 'md5';
import { sendOrderConfirmation, sendShopNewOrderNotification } from '../email-service/email.service';

export const handlePayHereNotify = async (req: Request, res: Response) => {
  // PayHere sends data as FORM DATA (x-www-form-urlencoded).
  // Ensure your Express app has app.use(express.urlencoded({ extended: true }));
  
  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig 
  } = req.body;

  const lockKey = `payhere_lock:${order_id}`;

  try {
    // 🔐 1. REDIS LOCK (Idempotency)
    // We try to set a lock key. 'NX' means "Only set if Not Exists". 'EX' expires in 30s.
    // If result is null, it means another request is already processing this Order ID.
    const acquiredLock = await redis.set(lockKey, 'processing', 'EX', 30, 'NX');

    if (!acquiredLock) {
        console.log(`⚠️ Duplicate webhook ignored for Order #${order_id}`);
        return res.status(200).send("Ignored: Duplicate Request");
    }

    // 🔐 2. VERIFY SIGNATURE (Anti-Tamper)
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

    // 🔄 3. FETCH ORDER
    // We use findFirst because order_id is your custom "orderNumber" string, not the MongoDB ObjectID
    const order = await prisma.order.findUnique({ 
        where: { orderNumber: order_id } 
    });

    if (!order) return res.status(404).send("Order not found");

    // 🛑 4. STATUS CHECK (Double Idempotency)
    if (order.status !== 'PENDING') {
        return res.status(200).send("Already Processed");
    }

    // ✅ 5. PROCESS SUCCESS
    if (status_code === "2") {
        await prisma.order.update({
            where: { id: order.id },
            data: { 
                status: 'CONFIRMED', // Paid orders are automatically confirmed
                paymentMethod: 'PAYHERE',
                trackingNumber: payment_id // Save PayHere ID for reference
            }
        });

        // Send Emails
        sendOrderConfirmation(order).catch(console.error);
        sendShopNewOrderNotification(order).catch(console.error);
        
        console.log(`✅ Payment Success for Order #${order_id}`);
    } else {
        // ❌ 6. PROCESS FAILURE
        // If payment failed (status -1 or -2), cancel the order
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
        });
        
        // TODO: Ideally, you should restore stock here since we deducted it at creation!
        console.log(`❌ Payment Failed for Order #${order_id}`);
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error("PayHere Webhook Error:", error);
    return res.status(500).send("Server Error");
  } finally {
    // Release the lock so future updates (like shipping) aren't blocked, 
    // though the status check handles safety effectively.
    await redis.del(lockKey);
  }
};
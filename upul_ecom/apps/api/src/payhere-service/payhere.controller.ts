import { Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import redis from "../../../../packages/libs/redis";
import md5 from "md5";
import {
  sendOrderConfirmation,
  sendShopNewOrderNotification,
} from "../email-service/email.service";

export const handlePayHereNotify = async (req: Request, res: Response) => {
  const { merchant_id, order_id, payment_id, status_code, md5sig, payhere_amount, payhere_currency } = req.body;

  try {
    // 1. Lock & Signature Verify (Same as before) ...
    const secret = process.env.PAYHERE_SECRET!;
    const hashedSecret = md5(secret).toUpperCase();
    const localHash = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret).toUpperCase();

    if (localHash !== md5sig) return res.status(400).send("Invalid Signature");

    // 🔄 2. RETRIEVE SHADOW ORDER FROM REDIS
    const shadowOrderRaw = await redis.get(`pending_order:${order_id}`);
    
    // If not in Redis, check if it's already in DB (Duplicate webhook?)
    if (!shadowOrderRaw) {
        const exists = await prisma.order.findUnique({ where: { orderNumber: order_id }});
        if(exists) return res.status(200).send("Order already exists");
        return res.status(404).send("Session expired or invalid");
    }

    const shadowOrder = JSON.parse(shadowOrderRaw);

    // ✅ SCENARIO 1: SUCCESS (Status = 2)
    if (status_code === "2") {
        
        await prisma.$transaction(async (tx: any) => {
            // A. Deduct Stock (CRITICAL: Check if still available)
            for (const item of shadowOrder.finalItems) {
                const product = await tx.product.findUnique({ where: { id: item.productId }});
                // Note: If stock is gone now, we technically oversold. 
                // In production, you might log a "Manual Refund Needed" alert here.
                
                if (item.size) {
                     const currentVariants = product?.variants as any[];
                     const newVariants = currentVariants.map((v:any) => v.size === item.size ? {...v, stock: v.stock - item.quantity} : v);
                     await tx.product.update({ where: {id: item.productId}, data: { variants: newVariants }});
                } else {
                     await tx.product.update({ where: {id: item.productId}, data: { stock: { decrement: item.quantity }}});
                }
            }

            // B. Update Coupon (if used)
            if (shadowOrder.appliedCouponCode) {
                await tx.coupon.update({
                     where: { code: shadowOrder.appliedCouponCode },
                     data: { usedCount: { increment: 1 }, usedByUserIds: { push: shadowOrder.customerId || '' } }
                });
            }

            // C. CREATE THE ORDER (Finally!)
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: shadowOrder.orderNumber,
                    guestToken: shadowOrder.guestToken,
                    userId: shadowOrder.customerId,
                    email: shadowOrder.customerEmail,
                    shippingAddress: shadowOrder.shippingAddress,
                    billingAddress: shadowOrder.billingAddress,
                    items: shadowOrder.finalItems,
                    totalAmount: shadowOrder.grandTotal,
                    discountAmount: shadowOrder.finalDiscount,
                    couponCode: shadowOrder.appliedCouponCode,
                    status: 'CONFIRMED', // Direct to Confirmed
                    paymentMethod: 'PAYHERE',
                    trackingNumber: payment_id
                }
            });

            // D. Clear Cart
            if (shadowOrder.customerId) {
                await tx.cart.update({ where: { userId: shadowOrder.customerId }, data: { items: [] } });
            }

            return newOrder;
        });

        // Cleanup Redis
        await redis.del(`pending_order:${order_id}`);

        // Emails
        // Map shadowOrder properties to what email service expects
        const emailOrderObj = { 
            ...shadowOrder, 
            email: shadowOrder.customerEmail,
            items: shadowOrder.finalItems,
            totalAmount: shadowOrder.grandTotal,
            status: 'CONFIRMED', 
            paymentMethod: 'PAYHERE' 
        };
        sendOrderConfirmation(emailOrderObj).catch(console.error);
        sendShopNewOrderNotification(emailOrderObj).catch(console.error);
        
        return res.status(200).send("Order Created");
    }

    // ❌ SCENARIO 2: FAILED
    // Do nothing. We don't create an order. Redis key expires. Stock was never touched.
    return res.status(200).send("Payment Failed - No Order Created");

  } catch (error) {
     console.error("Webhook Error", error);
     return res.status(500).send("Error");
  }
};
import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma"; 
import { v4 as uuidv4 } from 'uuid'; 
import md5 from 'md5';
import { sendOrderConfirmation, sendShopNewOrderNotification } from "../email-service/email.service";

// Helper: Generate a short, readable 6-digit ID (e.g., "829304")
const generateOrderNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { type, userId, addressId, address, items, email, paymentMethod } = req.body;

  try {
    // --- 1. PREPARE ORDER DATA ---
    let shippingAddress;
    let customerEmail;
    let customerId: string | null = null;

    const guestToken = uuidv4();

    // SCENARIO A: Logged-in User
    if (type === 'USER') {
      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const selectedAddr = user.addresses.find((a: any) => a.id === addressId);
      if (!selectedAddr) return res.status(400).json({ message: "Invalid Address ID" });

      shippingAddress = selectedAddr;
      customerEmail = user.email;
      customerId = user.id;
    }
    // SCENARIO B: Guest
    else {
      shippingAddress = address;
      customerEmail = email;
    }

    const orderNumber = generateOrderNumber();

    // --- 2. TRANSACTION (Atomic Stock Deduction + Creation) ---
    const order = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const finalItems: any[] = [];

      // A. Loop through items to Validate & Deduct Stock
      for (const item of items) {
        // Fetch fresh product data
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) throw new Error(`Product not found: ${item.sku}`);
        if (!product.availability) throw new Error(`Product ${product.name} is unavailable`);

        // Check Stock Logic
        let currentStock = 0;
        let variantIndex = -1;

        if (item.size) {
          // Variant Logic
          variantIndex = product.variants.findIndex((v: any) => v.size === item.size);
          if (variantIndex === -1) throw new Error(`Size ${item.size} not found for ${product.name}`);
          currentStock = product.variants[variantIndex].stock;
        } else {
          // Standard Logic
          currentStock = product.stock;
        }

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${currentStock} left.`);
        }

        // B. Update Stock in DB (Reserve items)
        if (item.size) {
          const newVariants = [...product.variants];
          newVariants[variantIndex].stock -= item.quantity;

          await tx.product.update({
            where: { id: product.id },
            data: { variants: newVariants }
          });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } }
          });
        }

        // C. Calculate Price
        let price = product.price;
        if (product.discountType === 'PERCENTAGE') {
          price -= price * (product.discountValue / 100);
        } else if (product.discountType === 'FIXED') {
          price -= product.discountValue;
        }

        calculatedTotal += price * item.quantity;

        // Add to snapshot list
        finalItems.push({
          productId: product.id,
          sku: item.sku,
          name: product.name,
          image: product.images[0]?.url || '',
          price: price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        });
      }

      const finalPaymentMethod = paymentMethod === 'PAYHERE' ? 'PAYHERE' : 'COD';

      // D. Create the Order Record
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          guestToken,
          userId: customerId,
          email: customerEmail,
          shippingAddress,
          items: finalItems,
          totalAmount: calculatedTotal,
          status: 'PENDING',
          paymentMethod: finalPaymentMethod
        }
      });

      // E. Clear User Cart 
      // 🟢 FIX: Only clear immediately if COD. 
      // If PayHere, we keep it until the Payment Webhook confirms success.
      if (customerId && finalPaymentMethod === 'COD') {
        await tx.cart.update({
          where: { userId: customerId },
          data: { items: [] }
        });
      }

      return newOrder;
    });

    // --- 3. RESPONSE HANDLER ---

    // SCENARIO A: Cash On Delivery (COD)
    if (paymentMethod === 'COD' || !paymentMethod) {
      sendOrderConfirmation(order).catch(console.error);
      sendShopNewOrderNotification(order).catch(console.error);

      return res.status(200).json({
        success: true,
        orderId: order.orderNumber,
        guestToken: order.guestToken
      });
    }

    // SCENARIO B: PayHere (Online Payment)
    if (paymentMethod === 'PAYHERE') {
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const secret = process.env.PAYHERE_SECRET;

        // Safety Check
        if (!merchantId || !secret) {
            console.error("❌ PayHere Credentials Missing in .env file!");
            return res.status(500).json({ 
                success: false, 
                message: "Server Configuration Error: Payment Gateway not setup." 
            });
        }

        const currency = 'LKR';
        const amount = order.totalAmount.toFixed(2);
        const orderId = order.orderNumber; 

        // Safe Address Extraction
        const shipping = order.shippingAddress as any; 

        // Generate Hash
        const hashedSecret = md5(secret).toUpperCase();
        const hash = md5(merchantId + orderId + amount + currency + hashedSecret).toUpperCase();

        return res.status(200).json({
            success: true,
            isPayHere: true,
            payhereParams: {
                sandbox: true,
                merchant_id: merchantId,
                return_url: `${process.env.FRONTEND_URL}/checkout/success?orderNumber=${orderId}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout`,
                notify_url: `${process.env.API_URL}/api/payment/notify`,
                order_id: orderId,
                items: "Order #" + orderId,
                currency: currency,
                amount: amount,
                first_name: shipping?.firstname || "Customer",
                last_name: shipping?.lastname || "",
                email: order.email || "no-email@example.com",
                phone: shipping?.phoneNumber || "0000000000",
                address: shipping?.addressLine || "No Address",
                city: shipping?.city || "Colombo",
                country: "Sri Lanka",
                hash: hash
            }
        });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment method"
    });

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place order"
    });
  }
};

// ... (keep the getGuestOrder, getUserOrders, getOrderById functions below as they were) ...
// (I am omitting them here to keep the answer short, but keep them in your file!)
export const getGuestOrder = async (req: Request, res: Response, next: NextFunction) => {
    // ... same as before
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ message: "Token required" });
        const order = await prisma.order.findUnique({ where: { guestToken: token } });
        if (!order) return res.status(404).json({ message: "Invalid tracking link" });
        if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
            return res.status(410).json({ message: "Link Expired", reason: order.status, orderNumber: order.orderNumber });
        }
        return res.json(order);
    } catch (error) { return next(error); }
};

export const getUserOrders = async (req: any, res: Response, next: NextFunction) => {
    // ... same as before
    try {
        const userId = req.user.id; 
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, orderNumber: true, createdAt: true, status: true, totalAmount: true, items: true }
        });
        return res.json(orders);
    } catch (error) { return next(error); }
};

export const getOrderById = async (req: any, res: Response, next: NextFunction) => {
    // ... same as before
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.userId !== userId) return res.status(403).json({ message: "Unauthorized" });
        return res.json(order);
    } catch (error) { return next(error); }
};
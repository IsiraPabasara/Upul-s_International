import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma"; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid'; 
import { sendOrderCancelled, sendOrderConfirmation, sendShopNewOrderNotification } from "../email-service/email.service";
import { validateCoupon } from "../coupen-service/coupon.service";
import md5 from 'md5';

// Helper: Generate a short, readable 6-digit ID (e.g., "829304")
const generateOrderNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { type, userId, addressId, address, items, email, paymentMethod, couponCode } = req.body; // 👈 Added couponCode

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

    // --- 2. TRANSACTION (Atomic Stock + Coupon + Order) ---
    const order = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const finalItems: any[] = [];

      // A. Loop through items to Validate & Deduct Stock
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) throw new Error(`Product not found: ${item.sku}`);
        if (!product.availability) throw new Error(`Product ${product.name} is unavailable`);

        // Check Stock Logic
        let currentStock = 0;
        let variantIndex = -1;

        if (item.size) {
          variantIndex = product.variants.findIndex((v: any) => v.size === item.size);
          if (variantIndex === -1) throw new Error(`Size ${item.size} not found for ${product.name}`);
          currentStock = product.variants[variantIndex].stock;
        } else {
          currentStock = product.stock;
        }

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${currentStock} left.`);
        }

        // B. Update Stock in DB
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

        // C. Calculate Item Price
        let price = product.price;
        if (product.discountType === 'PERCENTAGE') {
          price -= price * (product.discountValue / 100);
        } else if (product.discountType === 'FIXED') {
          price -= product.discountValue;
        }

        calculatedTotal += price * item.quantity;

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

      // --- D. COUPON LOGIC (RESTORED) ---
      let finalDiscount = 0;
      let appliedCouponCode: string | null = null;

      if (couponCode) {
        // Validate inside transaction to ensure data integrity
        const { coupon, discount } = await validateCoupon(
          couponCode,
          customerId,
          calculatedTotal
        );

        finalDiscount = discount;
        appliedCouponCode = coupon.code;

        // Increment usage count atomically
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: { increment: 1 },
            usedByUserIds: customerId ? { push: customerId } : undefined,
          },
        });
      }

      const grandTotal = Math.max(0, calculatedTotal - finalDiscount); // Ensure non-negative
      const finalPaymentMethod = paymentMethod === 'PAYHERE' ? 'PAYHERE' : 'COD';

      // --- E. Create Order ---
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          guestToken,
          userId: customerId,
          email: customerEmail,
          shippingAddress,
          items: finalItems,
          
          totalAmount: grandTotal,       // 👈 Uses discounted total
          discountAmount: finalDiscount, // 👈 Saves discount amount
          couponCode: appliedCouponCode, // 👈 Saves code used

          status: 'PENDING',
          paymentMethod: finalPaymentMethod
        }
      });

      // F. Clear Cart (Only if COD)
      if (customerId && finalPaymentMethod === 'COD') {
        await tx.cart.update({
          where: { userId: customerId },
          data: { items: [] }
        });
      }

      return newOrder;
    });

    // --- 3. RESPONSE HANDLER ---

    // SCENARIO A: COD
    if (paymentMethod === 'COD' || !paymentMethod) {
      sendOrderConfirmation(order).catch(console.error);
      sendShopNewOrderNotification(order).catch(console.error);

      return res.status(200).json({
        success: true,
        orderId: order.orderNumber,
        guestToken: order.guestToken
      });
    }

    // SCENARIO B: PayHere
    if (paymentMethod === 'PAYHERE') {
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const secret = process.env.PAYHERE_SECRET;

        if (!merchantId || !secret) {
            return res.status(500).json({ 
                success: false, 
                message: "Server Configuration Error: Payment Gateway not setup." 
            });
        }

        const currency = 'LKR';
        const amount = order.totalAmount.toFixed(2); // 👈 This now includes the coupon discount
        const orderId = order.orderNumber; 
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

    return res.status(400).json({ success: false, message: "Invalid payment method" });

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place order"
    });
  }
};


export const getGuestOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) return res.status(400).json({ message: "Token required" });

    const order = await prisma.order.findUnique({
      where: { guestToken: token }
    });

    if (!order) {
        return res.status(404).json({ message: "Invalid tracking link" });
    }

    // If the order is finished, we block access to protect customer privacy
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        return res.status(410).json({ 
            message: "Link Expired", 
            reason: order.status, // "DELIVERED" or "CANCELLED"
            orderNumber: order.orderNumber // Let them know which order it was
        });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
};


export const getUserOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id; // From middleware
    
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        totalAmount: true,
        items: true // Optional: if you want to show thumbnails in the list
      }
    });

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
};

// --- 6. GET SINGLE ORDER (Logged In) ---
export const getOrderById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Security Check: Ensure this order belongs to the user
    if (order.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this order" });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
};


// --- 7. CANCEL ORDER (Shared Logic for Stock Restoration) ---
const cancelOrderLogic = async (orderId: string, tx: any) => {
  // 1. Fetch current order to get items
  const currentOrder = await tx.order.findUnique({ where: { id: orderId } });
  
  if (!currentOrder) throw new Error("Order not found");
  if (currentOrder.status !== "PENDING") {
    throw new Error("Order cannot be cancelled. It has already been confirmed or processed.");
  }

  // 2. Update Status to CANCELLED
  const updatedOrder = await tx.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  // 3. RESTORE STOCK
  const items = currentOrder.items as any[];

  for (const item of items) {
    if (item.size) {
      // Handle Variants
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const newVariants = (product.variants as any[]).map((v: any) => {
          if (v.size === item.size) {
            return { ...v, stock: v.stock + item.quantity };
          }
          return v;
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { variants: newVariants },
        });
      }
    } else {
      // Handle Standard Stock
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  return updatedOrder;
};

// --- API: Cancel for Logged In User ---
export const cancelUserOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== userId) return res.status(403).json({ message: "Unauthorized" });

    const result = await prisma.$transaction(async (tx) => {
       return await cancelOrderLogic(id, tx);
    });

    // Send Email asynchronously
    sendOrderCancelled(result).catch(console.error);

    return res.json({ success: true, message: "Order cancelled successfully", order: result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// --- API: Cancel for Guest (via Token) ---
export const cancelGuestOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const order = await prisma.order.findUnique({ where: { guestToken: token } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const result = await prisma.$transaction(async (tx) => {
      return await cancelOrderLogic(order.id, tx);
    });

    // Send Email asynchronously
    sendOrderCancelled(result).catch(console.error);

    return res.json({ success: true, message: "Order cancelled successfully", order: result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
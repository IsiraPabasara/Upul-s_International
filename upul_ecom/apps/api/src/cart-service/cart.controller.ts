import { Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";

// Helper to sanitize items (Fixes Prisma Validation Error)
const sanitizeItem = (item: any) => ({
  productId: item.productId,
  sku: item.sku,
  name: item.name || "Product", // Fallback for safety
  price: Number(item.price), // Ensure number
  image: item.image || "",
  quantity: Number(item.quantity),
  // 👇 CRITICAL FIX: Ensure these are never undefined
  size: item.size || null, 
  color: item.color || null,
});

export const mergeCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { localItems } = req.body;

    // 1. Find or Create User's Cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, items: [] }
      });
    }

    // 2. Merge Logic
    // We cast to any[] to avoid TS strictness blocking the merge logic
    let finalItems: any[] = [...(cart.items as any[])];

    if (localItems && Array.isArray(localItems)) {
      for (const localItem of localItems) {
        const existingIndex = finalItems.findIndex(
          (dbItem) => dbItem.sku === localItem.sku
        );

        if (existingIndex > -1) {
          finalItems[existingIndex].quantity += localItem.quantity;
        } else {
          finalItems.push(localItem);
        }
      }
    }

    // 3. SANITIZE before saving (The Fix)
    // This ensures no 'undefined' fields crash Prisma
    const cleanItems = finalItems.map(sanitizeItem);

    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: { items: cleanItems } // 👈 Send clean data
    });

    return res.json(updatedCart.items);
  } catch (error) {
    return next(error);
  }
};

export const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      return res.json([]);
    }

    const visibleItems = await filterVisibleItems(cart.items);
    
    return res.json(visibleItems);
  } catch (error) {
    return next(error);
  }
};

const filterVisibleItems = async (items: any[]) => {
  const productIds = items.map((item) => item.productId);
  const visibleProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      visible: true,
    },
    select: {
      id: true,
    },
  });

  const visibleProductIds = new Set(visibleProducts.map((p) => p.id));
  return items.filter((item) => visibleProductIds.has(item.productId));
};

// --- 1. Add Item (Logged In) ---
export const addToCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const item = req.body; 

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || !product.visible) {
      return res.status(404).json({ message: "Product not found or not available" });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId, items: [] } });
    }

    const items = [...(cart.items as any[])];
    const existingIndex = items.findIndex((i) => i.sku === item.sku);

    if (existingIndex > -1) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }

    // 3. SANITIZE before saving
    const cleanItems = items.map(sanitizeItem);

    const updated = await prisma.cart.update({
      where: { userId },
      data: { items: cleanItems }
    });

    return res.json(updated.items);
  } catch (error) {
    return next(error);
  }
};

// --- 2. Update Quantity (Logged In) ---
export const updateCartItem = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sku, quantity } = req.body;

    const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });
    
    // Update and Sanitize
    const items = (cart.items as any[]).map(item => {
      if (item.sku === sku) {
        return sanitizeItem({ ...item, quantity });
      }
      return sanitizeItem(item);
    });

    const updated = await prisma.cart.update({
      where: { userId },
      data: { items }
    });

    return res.json(updated.items);
  } catch (error) {
    return next(error);
  }
};

// --- 3. Remove Item (Logged In) ---
export const removeCartItem = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sku } = req.params;

    const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });

    // Filter and Sanitize remaining items
    const items = (cart.items as any[])
      .filter(item => item.sku !== sku)
      .map(sanitizeItem);

    const updated = await prisma.cart.update({
      where: { userId },
      data: { items }
    });

    return res.json(updated.items);
  } catch (error) {
    return next(error);
  }
};
import { Request, Response, NextFunction } from "express";
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
    
    return res.json(cart ? cart.items : []);
  } catch (error) {
    return next(error);
  }
};

// --- 1. Add Item (Logged In) ---
export const addToCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const item = req.body; 

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


export const verifyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body; // Expecting array of { productId, quantity, size? }

    const errors: Record<string, string> = {};
    let isValid = true;

    // We fetch all relevant products at once to minimize DB calls
    const productIds = items.map((i: any) => i.productId);
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        visible: true,
        availability: true,
        stock: true,
        variants: true, // Need this to check size stock
      }
    });

    // Create a Map for easy lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      const errorKey = item.sku; // We map errors by SKU (unique per line item)

      // 1. Check Existence & Visibility
      if (!product || !product.visible) {
        errors[errorKey] = "Product is no longer available";
        isValid = false;
        continue;
      }

      // 2. Check General Availability Flag
      if (!product.availability) {
        errors[errorKey] = "Product is marked as out of stock";
        isValid = false;
        continue;
      }

      // 3. Check Specific Stock (Size vs Standard)
      if (item.size) {
        // It's a variant (e.g., "Small")
        const variant = product.variants.find(v => v.size === item.size);
        
        if (!variant) {
          errors[errorKey] = "This size is no longer available";
          isValid = false;
        } else if (variant.stock < item.quantity) {
          errors[errorKey] = `Only ${variant.stock} left in stock`;
          isValid = false;
        }
      } else {
        // It's a standard product (no variants)
        if (product.stock < item.quantity) {
          errors[errorKey] = `Only ${product.stock} left in stock`;
          isValid = false;
        }
      }
    }

    return res.json({ isValid, errors });

  } catch (error) {
    return next(error);
  }
};
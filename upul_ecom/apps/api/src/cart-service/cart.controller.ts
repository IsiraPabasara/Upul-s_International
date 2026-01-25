// apps/api/src/cart-service/cart.controller.ts
import { Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";

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
    let finalItems = [...cart.items];

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

    // 3. Save merged list to DB
    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: { items: finalItems }
    });

    return res.json(updatedCart.items);
  } catch (error) {
    return next(error); // <--- Added 'return'
  }
};

export const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    
    return res.json(cart ? cart.items : []);
  } catch (error) {
    return next(error); // <--- Added 'return'
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

    const items = [...cart.items];
    const existingIndex = items.findIndex((i) => i.sku === item.sku);

    if (existingIndex > -1) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }

    const updated = await prisma.cart.update({
      where: { userId },
      data: { items }
    });

    return res.json(updated.items); // <--- Added 'return'
  } catch (error) {
    return next(error); // <--- Added 'return'
  }
};

// --- 2. Update Quantity (Logged In) ---
export const updateCartItem = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sku, quantity } = req.body;

    const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });
    
    const items = cart.items.map(item => 
      item.sku === sku ? { ...item, quantity } : item
    );

    const updated = await prisma.cart.update({
      where: { userId },
      data: { items }
    });

    return res.json(updated.items); // <--- Added 'return'
  } catch (error) {
    return next(error); // <--- Added 'return'
  }
};

// --- 3. Remove Item (Logged In) ---
export const removeCartItem = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sku } = req.params;

    const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });

    const items = cart.items.filter(item => item.sku !== sku);

    const updated = await prisma.cart.update({
      where: { userId },
      data: { items }
    });

    return res.json(updated.items); // <--- Added 'return'
  } catch (error) {
    return next(error); // <--- Added 'return'
  }
};
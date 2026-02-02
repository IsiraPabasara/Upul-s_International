import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";

// 1. GET INVENTORY LIST (With Pagination) 📋
export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = 1, limit = 20 } = req.query; // Defaults

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    // Run Count and Query in parallel
    const [total, rawProducts] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          variants: true,
          images: true, // Select full object, process in JS
          updatedAt: true,
        }
      })
    ]);

    // Optimize Images
    const products = rawProducts.map(p => ({
      ...p,
      images: Array.isArray(p.images) && p.images.length > 0 ? [p.images[0]] : []
    }));

    return res.json({
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return next(error);
  }
};

// 2. BULK UPDATE STOCK 📦
// Accepts an array of updates: [{ sku: "A", variantSize: "S", newStock: 10 }, ...]
export const bulkUpdateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { updates } = req.body; // Expecting { updates: [...] }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Invalid updates array" });
    }

    // Process updates in a Transaction to ensure data integrity
    const results = await prisma.$transaction(async (tx) => {
      return Promise.all(
        updates.map(async (update: any) => {
          const product = await tx.product.findUnique({ where: { sku: update.sku } });
          
          if (!product) throw new Error(`Product ${update.sku} not found`);

          let updatedData: any = {};
          const stockVal = Number(update.newStock);

          // Variant Logic
          if (update.variantSize && Array.isArray(product.variants) && product.variants.length > 0) {
             const currentVariants = product.variants as any[];
             const vIndex = currentVariants.findIndex((v: any) => v.size === update.variantSize);
             
             if (vIndex > -1) {
                currentVariants[vIndex].stock = stockVal;
                const totalStock = currentVariants.reduce((sum, v) => sum + v.stock, 0);
                updatedData = { 
                  variants: currentVariants, 
                  stock: totalStock, 
                  availability: totalStock > 0 
                };
             }
          } else {
             // Simple Product Logic
             updatedData = { 
               stock: stockVal, 
               availability: stockVal > 0 
             };
          }

          // Return the update promise
          return tx.product.update({
            where: { sku: update.sku },
            data: updatedData
          });
        })
      );
    });

    return res.json({ success: true, count: results.length });
  } catch (error) {
    return next(error);
  }
};
import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    
    // 1. Generate SKU if missing
    let finalSKU = data.sku;
    if (!finalSKU) {
      finalSKU = await generateNextSku();
    }

    // 2. Check for Duplicates
    const existing = await prisma.product.findUnique({ where: { sku: finalSKU } });
    if (existing) {
      return res.status(400).json({ message: "Error generating unique SKU, please try again." });
    }

    // 3. 👇 CALCULATE STOCK LOGIC (The part that was missing)
    let finalStock = 0;
    
    // Check if variants exist AND have items
    if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
      // Option A: Sum of Variants
      finalStock = data.variants.reduce(
        (sum: number, v: any) => sum + Number(v.stock || 0), 0
      );
    } else {
      // Option B: Manual Stock Input (Simple Product)
      finalStock = Number(data.stock || 0);
    }

    // 4. Create Product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: finalSKU,
        description: data.description,
        price: parseFloat(data.price),
        
        // Auto-calculate availability
        stock: finalStock,
        availability: finalStock > 0, 
        
        // Default visible to true if not sent
        visible: data.visible !== undefined ? data.visible : true,

        brand: data.brand,
        images: data.images,
        colors: data.colors || [],
        categoryId: data.categoryId,
        sizeType: data.sizeType,
        variants: data.variants || [], // Save the variants array!
        discountType: data.discountType || "NONE",
        discountValue: parseFloat(data.discountValue || 0),
        isNewArrival: data.isNewArrival || false,
      },
    });
    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract query params (default to page 1, limit 10)
    const { page = 1, limit = 10, search, categoryId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build the "Where" clause based on filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { sku: { contains: String(search), mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = String(categoryId);
    }

    // Run two queries in parallel: Get Data + Get Total Count
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" }, // Newest first
        include: {
          category: { select: { name: true } }, // Just get category name
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// 2. TOGGLE VISIBILITY (Quick Switch) 👁️
export const toggleVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sku } = req.params;

    // 1. Get current state
    const currentProduct = await prisma.product.findUnique({
      where: { sku },
      select: { visible: true }
    });

    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2. Toggle it
    const newVisibility = !currentProduct.visible;

    // 3. Update
    const product = await prisma.product.update({
      where: { sku },
      data: { visible: newVisibility },
      select: { sku: true, visible: true },
    });

    return res.json({ success: true, visible: product.visible });
  } catch (error) {
    return next(error);
  }
};

const generateNextSku = async (prefix = "SKU") => {
  const lastProduct = await prisma.product.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!lastProduct || !lastProduct.sku) {
    return `${prefix}-1`;
  }

  const skuParts = lastProduct.sku.split("-");
  const lastNumber = parseInt(skuParts[skuParts.length - 1]);

  if (isNaN(lastNumber)) {
    return `${prefix}-${Date.now()}`;
  }

  return `${prefix}-${lastNumber + 1}`;
};

// 1. GET By SKU
export const getProductBySku = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sku } = req.params;

    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

// 2. UPDATE By SKU
// export const updateProductBySku = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { sku } = req.params;
//     const { 
//       name, description, price, stock, categoryId, 
//       images, variants, discountType, discountValue, brand, sizeType, visible
//     } = req.body;

//     // 1. Map Variants safely
//     const formattedVariants = Array.isArray(variants)
//       ? variants.map((v: any) => ({ size: v.size, stock: Number(v.stock) }))
//       : [];

//     // 2. 👇 CALCULATE STOCK LOGIC (Create vs Update must match)
//     let finalStock = 0;
    
//     if (formattedVariants.length > 0) {
//        // Option A: Sum of Variants
//        finalStock = formattedVariants.reduce((sum: number, v: any) => sum + v.stock, 0);
//     } else {
//        // Option B: Manual Stock Input
//        finalStock = Number(stock || 0);
//     }

//     const updatedProduct = await prisma.product.update({
//       where: { sku },
//       data: {
//         name,
//         description,
//         price: Number(price),
//         brand,
//         sizeType,
        
//         // Stock & Availability
//         stock: finalStock,
//         availability: finalStock > 0, 
        
//         // Visibility
//         visible: visible, 

//         category: categoryId ? { connect: { id: categoryId } } : undefined,
        
//         // IMPORTANT: We overwrite these arrays
//         images: images, 
//         variants: formattedVariants, 

//         discountType: discountType || "NONE",
//         discountValue: Number(discountValue || 0),
//       },
//     });

//     return res.json({ success: true, product: updatedProduct });
//   } catch (error) {
//     if ((error as any).code === 'P2002') {
//        return res.status(400).json({ error: "Duplicate value found." });
//     }
//     return next(error);
//   }
// };

export const updateProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    const { 
      name, description, price, stock, categoryId, 
      images, variants, discountType, discountValue, brand, sizeType, visible, colors, isNewArrival
    } = req.body;

    // 1. Ensure product exists
    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2. Format Variants safely
    const formattedVariants = Array.isArray(variants)
      ? variants.map((v: any) => ({ size: v.size, stock: Number(v.stock) }))
      : [];

    // 3. Calculate Stock
    let finalStock = 0;
    if (formattedVariants.length > 0) {
      finalStock = formattedVariants.reduce((sum: number, v: any) => sum + v.stock, 0);
    } else {
      finalStock = Number(stock || 0);
    }

    // 4. Update
    const updatedProduct = await prisma.product.update({
      where: { sku },
      data: {
        name,
        description,
        price: Number(price),
        brand,
        sizeType,
        stock: finalStock,
        availability: finalStock > 0, 
        visible: visible !== undefined ? visible : existingProduct.visible,
        isNewArrival: isNewArrival !== undefined ? isNewArrival : existingProduct.isNewArrival,
        
        // Use direct ID assignment if your schema allows it (usually categoryId: categoryId)
        // or keep connect but ensure categoryId exists
        categoryId: categoryId || existingProduct.categoryId,
        
        images: images || existingProduct.images, 
        colors: colors || existingProduct.colors,
        variants: formattedVariants, 

        discountType: discountType || "NONE",
        discountValue: Number(discountValue || 0),
      },
    });

    return res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Update Error:", error);
    if ((error as any).code === 'P2002') {
       return res.status(400).json({ error: "Duplicate value found." });
    }
    return next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    // Note: If you have relations (like CartItems), you might need to handle them first
    // or use Cascade Delete in Prisma schema.
    await prisma.product.delete({ where: { sku } });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};
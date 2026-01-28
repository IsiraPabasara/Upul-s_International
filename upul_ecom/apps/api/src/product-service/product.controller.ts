import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import { v4 as uuidv4 } from 'uuid';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    let finalSKU = data.sku;

    if (!finalSKU) {
      finalSKU = await generateNextSku();
    }

    const existing = await prisma.product.findUnique({
      where: { sku: finalSKU },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Error generating unique SKU, please try again." });
    }

    let calculatedStock = 0;
    if (data.variants && Array.isArray(data.variants)) {
      calculatedStock = data.variants.reduce(
        (sum: number, v: any) => sum + parseInt(v.stock || 0),
        0,
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: finalSKU,
        description: data.description,
        price: parseFloat(data.price),
        availability: data.availability,
        isNewArrival: data.isNewArrival,
        discountType: data.discountType, // "NONE", "PERCENTAGE", or "FIXED"
        discountValue: parseFloat(data.discountValue || 0),
        brand: data.brand,
        images: data.images,
        colors: data.colors || [],
        categoryId: data.categoryId,
        sizeType: data.sizeType, // Save the type (e.g. "Shoes")
        variants: data.variants, // Save the array [{size: "M", stock: 10}, ...]
        stock: calculatedStock, // Save the calculated total
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
    const products = await prisma.product.findMany();
    return res.json(products);
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
export const getProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;

    const product = await prisma.product.findUnique({
      where: { sku, visible:true },
      include: {
        category: true
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
export const updateProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    
    // Extract form data
    const { 
      name, description, price, stock, categoryId, 
      images,   // Expecting: ["https://...", "https://..."] OR full objects
      variants, // Expecting: [{ size: "M", stock: 10 }, ...]
      discountType,
      discountValue,
      brand,
      sizeType
    } = req.body;

    // 🛠️ DATA MAPPING (Crucial for Composite Types)
    
    // 1. Map Images: Convert simple URLs to your Schema's "ProductImage" type
    const formattedImages = Array.isArray(images) 
      ? images.map((img: any) => {
          // If it's already an object with url/fileId, keep it. If it's a string, format it.
          if (typeof img === 'string') {
            return { url: img, fileId: uuidv4() }; 
          }
          return { url: img.url, fileId: img.fileId || uuidv4() };
        })
      : [];

    // 2. Map Variants: Ensure it matches "ProductVariant" type exactly
    const formattedVariants = Array.isArray(variants)
      ? variants.map((v: any) => ({
          size: v.size,
          stock: Number(v.stock) 
        }))
      : [];

    // ⚡ UPDATE (No Transaction needed for MongoDB Embedded Types!)
    const updatedProduct = await prisma.product.update({
      where: { sku },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        brand,
        sizeType,
        
        // Handle Category Relation
        category: categoryId ? { connect: { id: categoryId } } : undefined,

        // Handle Embedded Arrays (Just overwrite them!)
        images: formattedImages, 
        variants: formattedVariants,

        // Handle Discount
        discountType: discountType || "NONE",
        discountValue: Number(discountValue || 0),
      },
    });

    return res.json({ success: true, product: updatedProduct });

  } catch (error) {
    // Unique Constraint Error (e.g. if you tried to change SKU to one that exists)
    if ((error as any).code === 'P2002') {
       return res.status(400).json({ error: "Duplicate value found (SKU or Slug)." });
    }
    return next(error);
  }
};
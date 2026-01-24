import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const existing = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (existing) {
      return res.status(400).json({ message: "Product with this SKU already exists !!!" });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        availability: data.availability,
        brand: data.brand,
        photos: data.photos,
        colors: data.colors,
        size: data.size,
        waistSize: data.waistSize ? parseInt(data.waistSize) : undefined,
        shoeSize: data.shoeSize ? parseInt(data.shoeSize) : undefined,
        collarSize: data.collarSize ? parseFloat(data.collarSize) : undefined,
        vestSize: data.vestSize,
        bustSize: data.bustSize ? parseInt(data.bustSize) : undefined,
        braSize: data.braSize,
      }
    });
    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany();
    return res.json(products);
  } catch (error) {
    return next(error);
  }
};

export const getProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    const product = await prisma.product.findUnique({
      where: { sku }
    });

    if (!product) {
      return res.status(404).json({ message: "Not found in the DB" });
    }
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};
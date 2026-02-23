import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';
import axios from 'axios'; // 🟢 Make sure you import axios!

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(brands);
  } catch (error) {
    return next(error);
  }
};

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🟢 Catch logoFileId from the frontend
    const { name, logoUrl, logoFileId } = req.body;
    
    const existing = await prisma.brand.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "Brand already exists" });
    }

    const brand = await prisma.brand.create({
      data: { 
        name,
        logoUrl: logoUrl || null,
        logoFileId: logoFileId || null // 🟢 Save it to the DB!
      }
    });

    return res.status(201).json(brand);
  } catch (error) {
    return next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // 1. Find the brand first so we know what file to delete!
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    // 2. Prevent deletion if products are currently using this brand
    const linkedProducts = await prisma.product.count({ where: { brandId: id } });
    if (linkedProducts > 0) {
      return res.status(400).json({ 
        message: `Cannot delete brand. It is linked to ${linkedProducts} products.` 
      });
    }

    // 🟢 3. Delete the actual image from ImageKit Cloud!
    if (brand.logoFileId) {
      try {
        // ImageKit requires Basic Auth using your Private Key + a colon ":"
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
        const authHeader = Buffer.from(privateKey + ':').toString('base64');
        
        await axios.delete(`https://api.imagekit.io/v1/files/${brand.logoFileId}`, {
          headers: {
            Authorization: `Basic ${authHeader}`
          }
        });
        console.log("Successfully deleted image from ImageKit");
      } catch (ikError) {
        console.error("Failed to delete image from ImageKit:", ikError);
        // We continue anyway so the broken brand doesn't get stuck in your database
      }
    }

    // 4. Finally, delete from your Database
    await prisma.brand.delete({ where: { id } });

    return res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

// 🟢 NEW: Update Brand Function
export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, logoFileId } = req.body;

    // 1. Find the existing brand first
    const existingBrand = await prisma.brand.findUnique({ where: { id } });
    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // 2. Check for name duplication (make sure they aren't renaming it to a brand that already exists)
    if (name && name.toLowerCase() !== existingBrand.name.toLowerCase()) {
      const duplicate = await prisma.brand.findUnique({ where: { name } });
      if (duplicate) {
        return res.status(400).json({ message: "A brand with this name already exists" });
      }
    }

    // 3. 💎 PRO UX: If they uploaded a NEW logo, delete the OLD one from ImageKit to save space!
    if (existingBrand.logoFileId && logoFileId && existingBrand.logoFileId !== logoFileId) {
      try {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
        const authHeader = Buffer.from(privateKey + ':').toString('base64');
        
        await axios.delete(`https://api.imagekit.io/v1/files/${existingBrand.logoFileId}`, {
          headers: {
            Authorization: `Basic ${authHeader}`
          }
        });
        console.log("Successfully deleted old logo from ImageKit");
      } catch (ikError) {
        console.error("Failed to delete old image from ImageKit:", ikError);
        // We continue anyway so the database still updates properly
      }
    }

    // 4. Update the brand in MongoDB
    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        logoUrl: logoUrl || null,
        logoFileId: logoFileId || null
      }
    });

    return res.status(200).json(updatedBrand);
  } catch (error) {
    return next(error);
  }
};
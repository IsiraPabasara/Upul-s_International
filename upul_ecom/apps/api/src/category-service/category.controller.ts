import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import slugify from "slugify";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, parentId, sortOrder } = req.body;

    // Generate slug: "Formal Shoes" -> "formal-shoes"
    const generatedSlug = slugify(name, { lower: true, strict: true });

    const category = await prisma.category.create({
      data: {
        name,
        slug: generatedSlug, // Required field
        sortOrder: sortOrder ? parseInt(sortOrder) : undefined, // Optional field
        parentId: parentId || undefined,
      },
    });

    return res.status(201).json(category);
  } catch (error: any) {
    // Handle unique constraint error for slug
    if (error.code === 'P2002') {
       return res.status(400).json({ error: "A category with this slug already exists." });
    }
    return next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { parentId, tree } = req.query; // 1. Destructure 'tree'

    const whereClause: any = {};

    if (parentId && typeof parentId === "string") {
      // Case A: Fetch specific children (e.g., clicking a folder)
      whereClause.parentId = parentId;
    } else if (tree === 'true') {
      // Case B: Fetch EVERYTHING (For Sidebar/Tree building)
      // We pass an empty whereClause so Prisma returns all records
    } else {
      // Case C: Default behavior (Header/Navigation)
      // Only fetch top-level roots to keep payload small
      whereClause.parentId = null; 
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        _count: {
          select: { children: true }
        }
      }
    });

    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};
// 1. Helper: Deletes children first, then the item itself
const deleteCategoryRecursive = async (categoryId: string) => {
  // Find immediate children
  const children = await prisma.category.findMany({
    where: { parentId: categoryId }
  });

  // Recursively delete each child FIRST
  for (const child of children) {
    await deleteCategoryRecursive(child.id);
  }

  // Once all children are gone, it's safe to delete the parent
  await prisma.category.delete({
    where: { id: categoryId }
  });
};

// 2. The Main Controller Function
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists first
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Run the recursive delete
    await deleteCategoryRecursive(id);

    return res.json({ message: "Category and all sub-categories deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, sortOrder } = req.body;

    const data: any = {};
    if (name) {
      data.name = name;
      data.slug = slugify(name, { lower: true, strict: true });
    }
    if (sortOrder !== undefined) {
      data.sortOrder = parseInt(sortOrder);
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};
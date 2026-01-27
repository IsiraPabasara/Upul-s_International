import { Router } from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  reorderCategories,
} from "./category.controller";

const router = Router();

router.put("/reorder", reorderCategories);
router.post("/", createCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);
router.put("/:id", updateCategory);

export default router;

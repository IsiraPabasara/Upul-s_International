import { Router } from 'express';
import { createCategory, getCategories, deleteCategory, updateCategory } from './category.controller';

const router = Router();

router.post('/', createCategory);
router.get('/', getCategories);
router.delete('/:id', deleteCategory);
router.put("/:id", updateCategory);

export default router;
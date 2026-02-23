import { Router } from 'express';
import { getSizeTypes, createSizeType, deleteSizeType , updateSizeType } from './sizetype.controller';

const router = Router();

router.get('/', getSizeTypes);
router.post('/', createSizeType);
router.delete('/:id', deleteSizeType);
router.put('/:id', updateSizeType);

export default router;
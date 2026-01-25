import { Router } from 'express';
import { createProduct, getAllProducts } from './product.controller';
import { getProductBySku, getShopProducts } from './shop.controller';

const router = Router();
router.get('/shop', getShopProducts);

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:sku', getProductBySku);




export default router;
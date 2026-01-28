import { Router } from 'express';
import { createProduct, getAllProducts ,getProductBySku , updateProductBySku} from './product.controller';
import {  getShopProducts } from './shop.controller';

const router = Router();
router.get('/shop', getShopProducts);

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:sku', getProductBySku);
router.put("/:sku", updateProductBySku);




export default router;
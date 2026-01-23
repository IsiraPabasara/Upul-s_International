import express, { Router } from 'express';
import { authRouter } from '../auth-service/routes/auth.router';
import productRoutes from '../product-service/product.routes';

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use('/products', productRoutes);

export default router;
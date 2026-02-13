import express, { Router } from 'express';
import { authRouter } from '../auth-service/routes/auth.router';
import productRoutes from '../product-service/product.routes';
import categoryRoutes from '../category-service/category-routes'
import brandRoutes from '../brand-service/brand.routes';
import imagekitRoutes from '../imagekit-service/imagekit.routes';
import sizeTypeRoutes from '../sizetype-service/sizetype.routes';
import colorRoutes from '../color-service/color.routes';
import cartRouter from '../cart-service/cart.routes';
import wishlistRouter from '../wishlist-service/wishlist.router';
import orderRouter from '../order-service/order.router';
import analyticsRoutes from "../analytics/analytics.routes";
import emailRoutes from '../email-service/email.routes';
import couponsRoutes from '../coupen-service/coupen.routes';

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/imagekit', imagekitRoutes);
router.use('/size-types', sizeTypeRoutes);
router.use('/colors', colorRoutes);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/orders', orderRouter);
router.use("/analytics", analyticsRoutes);
router.use('/admin/email', emailRoutes);
router.use('/coupons', couponsRoutes);



export default router;
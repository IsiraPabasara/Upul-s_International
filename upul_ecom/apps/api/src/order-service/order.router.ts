import { Router } from 'express';
import { createOrder, getGuestOrder, getOrderById, getUserOrders } from './order.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { isAdmin } from '../../../../packages/middleware/authorizedRoles';
import { getAllOrders, getOrderDetails, updateOrderStatus } from './admin.order.controller';

const router = Router();

// This must be PUBLIC (no isAuthenticated middleware)
// The controller handles the security/user logic internally
router.post('/', createOrder);
router.get('/track/:token', getGuestOrder);

// Admin routes - must come BEFORE isAuthenticated middleware application
router.get('/admin', isAuthenticated, isAdmin, getAllOrders);
router.get('/admin/:orderId', isAuthenticated, isAdmin, getOrderDetails);
router.patch('/admin/:orderId/status', isAuthenticated, isAdmin, updateOrderStatus);
router.get('/my-orders', isAuthenticated, getUserOrders);
router.get('/my-orders/:id', isAuthenticated, getOrderById);

export default router;
import { Router } from 'express';
import { cancelGuestOrder, cancelUserOrder, createOrder, getGuestOrder, getOrderById, getUserOrders } from './order.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { isAdmin } from '../../../../packages/middleware/authorizedRoles';
import { getAllOrders, getOrderDetails, updateOrderStatus } from './admin.order.controller';
import { refundOrder } from './admin.refund.controller';

const router = Router();

// This must be PUBLIC (no isAuthenticated middleware)
// The controller handles the security/user logic internally
router.post('/', createOrder);
router.get('/track/:token', getGuestOrder);
router.patch('/track/:token/cancel', cancelGuestOrder);
router.post('/admin/:orderId/refund', isAuthenticated, isAdmin, refundOrder);

// Admin routes - must come BEFORE isAuthenticated middleware application
router.get('/admin', isAuthenticated, isAdmin, getAllOrders);
router.get('/admin/:orderId', isAuthenticated, isAdmin, getOrderDetails);
router.patch('/admin/:orderId/status', isAuthenticated, isAdmin, updateOrderStatus);
router.get('/my-orders', isAuthenticated, getUserOrders);
router.get('/my-orders/:id', isAuthenticated, getOrderById);
router.patch('/my-orders/:id/cancel', isAuthenticated, cancelUserOrder);

export default router;
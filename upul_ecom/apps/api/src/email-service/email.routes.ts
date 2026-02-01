import { Router } from 'express';
import {
  getEmailQueueStatus,
  getFailedEmailsList,
  getOrderEmailHistory,
  retryFailedEmailManually,
  getEmailStatistics,
  cleanupOldEmailLogs,
} from './email.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { isAdmin } from '../../../../packages/middleware/authorizedRoles';


const router = Router();

// All email admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// Get email queue statistics
router.get('/queue/stats', getEmailQueueStatus);

// Get failed emails list
router.get('/failed', getFailedEmailsList);

// Get email statistics
router.get('/statistics', getEmailStatistics);

// Get email history for an order
router.get('/order/:orderNumber', getOrderEmailHistory);

// Retry a failed email
router.post('/retry/:emailLogId', retryFailedEmailManually);

// Cleanup old email logs (optional)
router.delete('/cleanup', cleanupOldEmailLogs);

export default router;

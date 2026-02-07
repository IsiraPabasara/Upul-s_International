import { Router } from 'express';
import {
  getEmailQueueStatus,
  getEmailLogs, 
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

// ⚡ UPDATED: Get email logs (Supports filters: status, search, page)
router.get('/logs', getEmailLogs);

// Get email statistics
router.get('/statistics', getEmailStatistics);

// Get email history for an order
router.get('/order/:orderNumber', getOrderEmailHistory);

// Retry a failed email
router.post('/retry/:emailLogId', retryFailedEmailManually);

// Cleanup old email logs
router.delete('/cleanup', cleanupOldEmailLogs);

export default router;
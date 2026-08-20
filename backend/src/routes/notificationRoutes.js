import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications - Get user notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread/count - Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', notificationController.markAllNotificationsRead);

// GET /api/notifications/:id - Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markNotificationRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

// POST /api/notifications - Create notification (admin/system)
router.post('/', notificationController.createNotification);

export default router;

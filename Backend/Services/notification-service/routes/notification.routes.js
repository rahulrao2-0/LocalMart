import express from 'express';
import {
    getNotifications,
    getUnreadCount,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.get('/:id', getNotificationById);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

export default router;

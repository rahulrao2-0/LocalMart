import notificationService from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId || req.query?.userId || req.params?.userId;
        const limit = parseInt(req.query.limit) || 20;
        const skip = parseInt(req.query.skip) || 0;
        const unreadOnly = req.query.unreadOnly === 'true' || req.query.unread === 'true';

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const notifications = await notificationService.getUserNotifications(userId, limit, skip, unreadOnly);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId || req.query?.userId || req.params?.userId;
        const count = await notificationService.getUnreadCount(userId);
        res.status(200).json({ success: true, count });
    } catch (error) {
        next(error);
    }
};

export const getNotificationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.getNotificationById(id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        const currentUserId = req.user?.id || req.user?.userId || req.query?.userId;
        if (currentUserId && notification.userId !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id);
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId || req.query?.userId || req.params?.userId;
        await notificationService.markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        await notificationService.deleteNotification(id);
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};

export const deleteAllNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId || req.query?.userId || req.params?.userId;
        await notificationService.deleteAllNotifications(userId);
        res.status(200).json({ success: true, message: 'All notifications deleted' });
    } catch (error) {
        next(error);
    }
};

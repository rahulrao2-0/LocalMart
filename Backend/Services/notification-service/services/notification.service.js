import Notification from '../models/Notification.js';
import * as socketService from './socket.service.js';
import emailService from './email.service.js';
import templateService from './template.service.js';

class NotificationService {
    async createNotification(payload) {
        try {
            const notification = await Notification.create({
                userId: payload.userId,
                role: payload.role,
                title: payload.title,
                message: payload.message,
                type: payload.type,
                metadata: payload.metadata
            });

            if (payload.userEmail) {
                const { subject, htmlContent } = templateService.getTemplate(payload.type, payload);
                emailService.sendEmail(payload.userEmail, subject, htmlContent).catch(err => console.error('Email Error:', err.message));
            }

            socketService.sendNotification(payload.userId, 'notification', notification);

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async getUserNotifications(userId, limit = 20, skip = 0) {
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getUnreadCount(userId) {
        return await Notification.countDocuments({ userId, isRead: false });
    }

    async getNotificationById(id) {
        return await Notification.findById(id);
    }

    async markAsRead(id) {
        const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (notification) {
             socketService.sendNotification(notification.userId, 'notification-read', { id });
        }
        return notification;
    }

    async markAllAsRead(userId) {
        const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        return result;
    }

    async deleteNotification(id) {
        const notification = await Notification.findByIdAndDelete(id);
        if (notification) {
             socketService.sendNotification(notification.userId, 'notification-delete', { id });
        }
        return notification;
    }

    async deleteAllNotifications(userId) {
        return await Notification.deleteMany({ userId });
    }
}

export default new NotificationService();

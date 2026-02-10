// Notification system

const Notifications = {
    // Create notification
    create(userId, notificationData) {
        const notification = {
            id: Utils.generateId(),
            userId,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'info',
            link: notificationData.link || null,
            read: false,
            createdAt: new Date().toISOString()
        };

        Database.add('notifications', notification);
        return notification;
    },

    // Get notifications by user
    getByUser(userId) {
        const notifications = Database.find('notifications', { userId });
        return notifications.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    },

    // Get unread count
    getUnreadCount(userId) {
        const notifications = this.getByUser(userId);
        return notifications.filter(n => !n.read).length;
    },

    // Mark as read
    markAsRead(id) {
        return Database.update('notifications', id, { read: true });
    },

    // Mark all as read
    markAllAsRead(userId) {
        const notifications = this.getByUser(userId);
        notifications.forEach(n => {
            if (!n.read) {
                this.markAsRead(n.id);
            }
        });
    },

    // Delete notification
    delete(id) {
        return Database.delete('notifications', id);
    },

    // Clear all notifications
    clearAll(userId) {
        const notifications = this.getByUser(userId);
        notifications.forEach(n => this.delete(n.id));
    }
};

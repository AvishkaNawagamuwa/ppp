const db = require('../config/database');

class NotificationModel {
    // Create new notification
    static async createNotification(notificationData) {
        try {
            const { recipient_type, recipient_id, title, message, type, related_entity_type, related_entity_id } = notificationData;

            // Map type to notification_type
            const typeMapping = {
                'info': 'system_alert',
                'success': 'approval_request',
                'warning': 'therapist_application',
                'error': 'spa_registration'
            };

            const query = `
                INSERT INTO system_notifications (
                    recipient_type, recipient_id, title, message, notification_type,
                    related_entity_type, related_entity_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            // Map frontend recipient_type to database recipient_type
            const recipientTypeMapping = {
                'lsa': 'admin_lsa',
                'spa': 'admin_spa'
            };

            const [result] = await db.execute(query, [
                recipientTypeMapping[recipient_type] || recipient_type,
                recipient_id,
                title,
                message,
                typeMapping[type] || 'system_alert',
                related_entity_type,
                related_entity_id
            ]);

            return { id: result.insertId, success: true };
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Get notifications for specific recipient
    static async getNotificationsByRecipient(recipient_type, recipient_id, unreadOnly = false) {
        try {
            // Map frontend recipient_type to database recipient_type
            const recipientTypeMapping = {
                'lsa': 'admin_lsa',
                'spa': 'admin_spa'
            };

            let query = `
                SELECT n.*, 
                       CASE 
                           WHEN n.related_entity_type = 'spa' THEN s.name
                           WHEN n.related_entity_type = 'therapist' THEN t.name
                           ELSE NULL
                       END as related_entity_name
                FROM system_notifications n
                LEFT JOIN spas s ON n.related_entity_type = 'spa' AND n.related_entity_id = s.id
                LEFT JOIN therapists t ON n.related_entity_type = 'therapist' AND n.related_entity_id = t.id
                WHERE n.recipient_type = ?
            `;

            const params = [recipientTypeMapping[recipient_type] || recipient_type];

            if (recipient_id) {
                query += ' AND n.recipient_id = ?';
                params.push(recipient_id);
            }

            if (unreadOnly) {
                query += ' AND n.is_read = FALSE';
            }

            query += ' ORDER BY n.created_at DESC';

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId) {
        try {
            const query = `
                UPDATE system_notifications 
                SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;

            await db.execute(query, [notificationId]);
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Get unread count
    static async getUnreadCount(recipient_type, recipient_id) {
        try {
            // Map frontend recipient_type to database recipient_type
            const recipientTypeMapping = {
                'lsa': 'admin_lsa',
                'spa': 'admin_spa'
            };

            let query = `
                SELECT COUNT(*) as count 
                FROM system_notifications 
                WHERE recipient_type = ? AND is_read = FALSE
            `;

            const params = [recipientTypeMapping[recipient_type] || recipient_type];

            if (recipient_id) {
                query += ' AND recipient_id = ?';
                params.push(recipient_id);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    // Bulk mark as read
    static async markAllAsRead(recipient_type, recipient_id) {
        try {
            const query = `
                UPDATE system_notifications 
                SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
                WHERE recipient_type = ? AND recipient_id = ? AND is_read = FALSE
            `;

            await db.execute(query, [recipient_type, recipient_id]);
            return { success: true };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Delete old notifications (cleanup)
    static async deleteOldNotifications(days = 30) {
        try {
            const query = `
                DELETE FROM system_notifications 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
            `;

            const [result] = await db.execute(query, [days]);
            return { deleted: result.affectedRows };
        } catch (error) {
            console.error('Error deleting old notifications:', error);
            throw error;
        }
    }
}

module.exports = NotificationModel;
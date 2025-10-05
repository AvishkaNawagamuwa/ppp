const db = require('../config/database');

class ActivityLogModel {
    // Create new activity log
    static async logActivity(activityData) {
        try {
            const {
                entity_type, entity_id, action, description,
                actor_type, actor_id, actor_name,
                old_status, new_status, metadata
            } = activityData;

            const query = `
                INSERT INTO activity_logs (
                    entity_type, entity_id, action, description,
                    actor_type, actor_id, actor_name,
                    old_status, new_status, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                entity_type,
                entity_id,
                action,
                description || null,
                actor_type,
                actor_id || null,
                actor_name || null,
                old_status || null,
                new_status || null,
                metadata ? JSON.stringify(metadata) : null
            ]);

            return { id: result.insertId, success: true };
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    // Get recent activities for dashboard
    static async getRecentActivities(limit = 20, entity_type = null, actor_type = null) {
        try {
            let query = `
                SELECT 
                    al.*,
                    CASE 
                        WHEN al.entity_type = 'therapist' THEN CONCAT(t.fname, ' ', t.lname)
                        WHEN al.entity_type = 'spa' THEN s.name
                        ELSE 'System'
                    END as entity_name,
                    CASE 
                        WHEN al.entity_type = 'spa' THEN s.owner_email
                        WHEN al.entity_type = 'therapist' THEN t.email
                        ELSE NULL
                    END as entity_contact
                FROM activity_logs al
                LEFT JOIN therapists t ON al.entity_type = 'therapist' AND al.entity_id = t.id
                LEFT JOIN spas s ON al.entity_type = 'spa' AND al.entity_id = s.id
                WHERE 1=1
            `;

            const params = [];

            if (entity_type) {
                query += ' AND al.entity_type = ?';
                params.push(entity_type);
            }

            if (actor_type) {
                query += ' AND al.actor_type = ?';
                params.push(actor_type);
            }

            query += ' ORDER BY al.created_at DESC LIMIT ?';
            params.push(limit);

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        }
    }

    // Get activities for specific entity
    static async getEntityActivities(entity_type, entity_id) {
        try {
            const query = `
                SELECT al.*, 
                       CASE 
                           WHEN al.entity_type = 'therapist' THEN CONCAT(t.fname, ' ', t.lname)
                           WHEN al.entity_type = 'spa' THEN s.name
                           ELSE 'System'
                       END as entity_name
                FROM activity_logs al
                LEFT JOIN therapists t ON al.entity_type = 'therapist' AND al.entity_id = t.id
                LEFT JOIN spas s ON al.entity_type = 'spa' AND al.entity_id = s.id
                WHERE al.entity_type = ? AND al.entity_id = ?
                ORDER BY al.created_at DESC
            `;

            const [rows] = await db.execute(query, [entity_type, entity_id]);
            return rows;
        } catch (error) {
            console.error('Error fetching entity activities:', error);
            throw error;
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(actor_type = null) {
        try {
            let query = `
                SELECT 
                    action,
                    COUNT(*) as count,
                    DATE(created_at) as date
                FROM activity_logs
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;

            const params = [];

            if (actor_type) {
                query += ' AND actor_type = ?';
                params.push(actor_type);
            }

            query += ' GROUP BY action, DATE(created_at) ORDER BY created_at DESC';

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
}

module.exports = ActivityLogModel;
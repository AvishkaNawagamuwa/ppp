const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class SpaModel {
    // Register new spa (AdminSPA Registration)
    static async createSpa(spaData, files = {}) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const {
                name, spa_br_number, spa_tel,
                owner_fname, owner_lname, owner_email, owner_nic, owner_tel, owner_cell,
                address_line1, address_line2, province, postal_code
            } = spaData;

            // Process file paths
            const nic_front_path = files.nic_front ? `/uploads/spas/${files.nic_front[0].filename}` : null;
            const nic_back_path = files.nic_back ? `/uploads/spas/${files.nic_back[0].filename}` : null;
            const br_attachment_path = files.br_attachment ? `/uploads/spas/${files.br_attachment[0].filename}` : null;
            const tax_registration_path = files.tax_registration ? `/uploads/spas/${files.tax_registration[0].filename}` : null;
            const other_doc_path = files.other_doc ? `/uploads/spas/${files.other_doc[0].filename}` : null;

            // Process facility photos (minimum 5 required)
            const facility_photos = files.facility_photos ?
                files.facility_photos.map(file => `/uploads/spas/facility/${file.filename}`) : [];

            // Process professional certifications
            const professional_certifications = files.professional_certifications ?
                files.professional_certifications.map(file => `/uploads/spas/certifications/${file.filename}`) : [];

            const query = `
                INSERT INTO spas (
                    name, spa_br_number, spa_tel,
                    owner_fname, owner_lname, owner_email, owner_nic, owner_tel, owner_cell,
                    address_line1, address_line2, province, postal_code,
                    nic_front_path, nic_back_path, br_attachment_path, tax_registration_path, other_doc_path,
                    facility_photos, professional_certifications,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `;

            const values = [
                name, spa_br_number, spa_tel,
                owner_fname, owner_lname, owner_email, owner_nic, owner_tel, owner_cell,
                address_line1, address_line2, province, postal_code,
                nic_front_path, nic_back_path, br_attachment_path, tax_registration_path, other_doc_path,
                JSON.stringify(facility_photos), JSON.stringify(professional_certifications)
            ];

            const [result] = await connection.execute(query, values);

            // Log activity
            await this.logActivity(connection, 'spa', result.insertId, 'created',
                `New spa registration: ${name}`, 'spa', result.insertId, `${owner_fname} ${owner_lname}`);

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get spa profile by ID
    static async getSpaById(spaId) {
        const query = 'SELECT * FROM spas WHERE id = ?';
        const [rows] = await db.execute(query, [spaId]);
        return rows[0];
    }

    // Get spa dashboard statistics
    static async getSpaStats(spaId) {
        const query = 'SELECT * FROM spa_dashboard_stats WHERE spa_id = ?';
        const [rows] = await db.execute(query, [spaId]);
        return rows[0] || {
            spa_id: spaId,
            approved_therapists: 0,
            pending_requests: 0,
            rejected_requests: 0,
            resigned_therapists: 0,
            terminated_therapists: 0,
            total_therapists: 0
        };
    }

    // Update spa verification status (AdminLSA)
    static async updateSpaStatus(spaId, status, reason = null, verifiedBy = null) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const query = `
                UPDATE spas 
                SET status = ?, rejection_reason = ?, verified_at = ?, verified_by = ? 
                WHERE id = ?
            `;

            const values = [
                status,
                reason,
                status === 'verified' ? new Date() : null,
                verifiedBy,
                spaId
            ];

            await connection.execute(query, values);

            // Log activity
            const spa = await this.getSpaById(spaId);
            await this.logActivity(connection, 'spa', spaId, status,
                `Spa ${status}: ${spa.name}`, 'lsa', null, verifiedBy);

            // Create notification for spa
            await this.createNotification(connection, 'spa', spaId,
                `Spa ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                status === 'verified' ?
                    'Your spa has been verified and approved!' :
                    `Your spa verification was rejected. Reason: ${reason}`,
                status === 'verified' ? 'success' : 'error'
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get all spas for LSA dashboard
    static async getAllSpas(status = null) {
        let query = 'SELECT * FROM spas';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Helper method to log activities
    static async logActivity(connection, entityType, entityId, action, description, actorType, actorId, actorName) {
        const query = `
            INSERT INTO activity_logs (entity_type, entity_id, action, description, actor_type, actor_id, actor_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(query, [entityType, entityId, action, description, actorType, actorId, actorName]);
    }

    // Helper method to create notifications
    static async createNotification(connection, recipientType, recipientId, title, message, type = 'info', relatedEntityType = null, relatedEntityId = null) {
        const query = `
            INSERT INTO system_notifications (recipient_type, recipient_id, title, message, type, related_entity_type, related_entity_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(query, [recipientType, recipientId, title, message, type, relatedEntityType, relatedEntityId]);
    }

    // Get admin statistics for dashboard
    static async getAdminStats() {
        try {
            const [result] = await db.execute(`
                SELECT 
                    COUNT(*) as total_spas,
                    SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_spas,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_verification,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_spas
                FROM spas
            `);
            return result[0];
        } catch (error) {
            console.error('Error getting spa admin stats:', error);
            return {
                total_spas: 0,
                verified_spas: 0,
                pending_verification: 0,
                rejected_spas: 0
            };
        }
    }

    // Get recent activities
    static async getRecentActivities(limit = 10) {
        try {
            const limitNum = parseInt(limit) || 10;
            const [activities] = await db.execute(`
                SELECT * FROM activity_logs 
                ORDER BY created_at DESC 
                LIMIT ${limitNum}
            `);
            return activities.map(activity => ({
                id: activity.id,
                message: activity.description,
                time: this.formatTimeAgo(activity.created_at),
                type: activity.entity_type,
                created_at: activity.created_at
            }));
        } catch (error) {
            console.error('Error getting recent activities:', error);
            return [];
        }
    }

    // Get system notifications
    static async getSystemNotifications() {
        try {
            const [notifications] = await db.execute(`
                SELECT * FROM system_notifications 
                WHERE recipient_type = 'admin_lsa' 
                ORDER BY created_at DESC 
                LIMIT 20
            `);
            return notifications;
        } catch (error) {
            console.error('Error getting system notifications:', error);
            return [];
        }
    }

    // Get admin notifications (for the /notifications route)
    static async getAdminNotifications(filters = {}) {
        try {
            let query = `
                SELECT 
                    id,
                    title,
                    message,
                    notification_type as type,
                    is_read as \`read\`,
                    created_at,
                    related_entity_type,
                    related_entity_id
                FROM system_notifications 
                WHERE recipient_type = 'admin_lsa' 
            `;
            const params = [];

            if (filters.type && filters.type !== 'all') {
                query += ' AND notification_type = ?';
                params.push(filters.type);
            }

            if (filters.read_status && filters.read_status !== 'all') {
                query += ' AND is_read = ?';
                params.push(filters.read_status === 'read' ? 1 : 0);
            }

            query += ' ORDER BY created_at DESC LIMIT 50';

            const [notifications] = await db.execute(query, params);
            return notifications;
        } catch (error) {
            console.error('Error getting admin notifications:', error);
            return [];
        }
    }

    // Get unread notification count
    static async getUnreadNotificationCount() {
        try {
            const [result] = await db.execute(`
                SELECT COUNT(*) as count 
                FROM system_notifications 
                WHERE recipient_type = 'admin_lsa' AND is_read = 0
            `);
            return result[0].count;
        } catch (error) {
            console.error('Error getting unread notification count:', error);
            return 0;
        }
    }

    // Get admin notifications with filters
    static async getAdminNotifications(filters = {}) {
        try {
            let query = `
                SELECT * FROM system_notifications 
                WHERE recipient_type = 'admin_lsa'
            `;
            const params = [];
            const conditions = [];

            if (filters.type) {
                conditions.push('notification_type = ?');
                params.push(filters.type);
            }

            if (filters.read_status === 'read') {
                conditions.push('is_read = 1');
            } else if (filters.read_status === 'unread') {
                conditions.push('is_read = 0');
            }

            if (conditions.length > 0) {
                query += ' AND ' + conditions.join(' AND ');
            }

            query += ' ORDER BY created_at DESC LIMIT 50';

            const [notifications] = await db.execute(query, params);
            return notifications;
        } catch (error) {
            console.error('Error getting admin notifications:', error);
            return [];
        }
    }

    // Helper method to format time ago
    static formatTimeAgo(date) {
        const now = new Date();
        const diffInMs = now - new Date(date);
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
    }

    // Update getAllSpas method to support filtering
    static async getAllSpas(filters = {}) {
        try {
            let query = `
                SELECT 
                    id as spa_id,
                    name as spa_name,
                    CONCAT(COALESCE(owner_fname, ''), ' ', COALESCE(owner_lname, '')) as owner_name,
                    email,
                    phone as contact_phone,
                    address as city,
                    verification_status,
                    status,
                    created_at
                FROM spas
            `;
            const params = [];
            const conditions = [];

            if (filters.status && filters.status !== 'all') {
                conditions.push('status = ?');
                params.push(filters.status);
            }

            if (filters.verification_status && filters.verification_status !== 'all') {
                conditions.push('verification_status = ?');
                params.push(filters.verification_status);
            }

            if (filters.search) {
                conditions.push('(name LIKE ? OR COALESCE(owner_fname, "") LIKE ? OR COALESCE(owner_lname, "") LIKE ? OR email LIKE ?)');
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY created_at DESC';

            // Simple pagination
            if (filters.limit) {
                const limit = Math.max(1, parseInt(filters.limit) || 10);
                query += ` LIMIT ${limit}`;

                if (filters.page && parseInt(filters.page) > 1) {
                    const offset = (parseInt(filters.page) - 1) * limit;
                    query += ` OFFSET ${offset}`;
                }
            } else {
                query += ' LIMIT 50';
            }

            const [spas] = await db.execute(query, params);
            return { spas };
        } catch (error) {
            console.error('Error getting all spas:', error);
            return { spas: [] };
        }
    }
}

module.exports = SpaModel;
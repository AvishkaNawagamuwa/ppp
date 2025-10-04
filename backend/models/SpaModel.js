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
}

module.exports = SpaModel;
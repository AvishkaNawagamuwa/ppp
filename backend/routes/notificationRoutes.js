// Database-integrated notification system
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/lsa/notifications - Create new notification
router.post('/notifications', async (req, res) => {
    try {
        const {
            recipient_id,
            recipient_type = 'admin_lsa',
            sender_id,
            title,
            message,
            type,
            reference_id,
            reference_type
        } = req.body;

        // Insert notification into database
        const [result] = await db.execute(
            `INSERT INTO notifications 
            (recipient_id, recipient_type, sender_id, title, message, type, reference_id, reference_type, is_read) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [recipient_id, recipient_type, sender_id, title, message, type, reference_id, reference_type]
        );

        // Get the created notification
        const [notification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [result.insertId]
        );

        console.log('📧 New notification created:', title);

        // Emit real-time notification via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.to('lsa').emit('newNotification', notification[0]);
        }

        res.json({
            success: true,
            message: 'Notification created successfully',
            data: notification[0]
        });
    } catch (error) {
        console.error('Notification creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
});

// GET /api/lsa/notifications/unread - Get unread notifications
router.get('/notifications/unread', async (req, res) => {
    try {
        const [notifications] = await db.execute(
            `SELECT * FROM notifications 
            WHERE recipient_type = 'admin_lsa' AND is_read = 0 
            ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get unread notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});

// GET /api/lsa/notifications - Get all notifications
router.get('/notifications', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const [notifications] = await db.execute(
            `SELECT * FROM notifications 
            WHERE recipient_type = 'admin_lsa' 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );

        // Get total count
        const [countResult] = await db.execute(
            `SELECT COUNT(*) as total FROM notifications WHERE recipient_type = 'admin_lsa'`
        );

        res.json({
            success: true,
            data: notifications,
            total: countResult[0].total
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});

// PUT /api/lsa/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);

        const [result] = await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [notificationId]
        );

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// GET /api/lsa/notifications/therapist/:therapistId - Get notifications for specific therapist
router.get('/notifications/therapist/:therapistId', async (req, res) => {
    try {
        const therapistId = parseInt(req.params.therapistId);

        const [notifications] = await db.execute(
            `SELECT * FROM notifications 
            WHERE reference_type = 'therapist' AND reference_id = ? 
            ORDER BY created_at DESC`,
            [therapistId]
        );

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get therapist notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get therapist notifications'
        });
    }
});

// POST /api/lsa/therapists/:id/approve - Approve therapist
router.post('/therapists/:id/approve', async (req, res) => {
    try {
        const therapistId = parseInt(req.params.id);
        const { approvedBy = 1 } = req.body; // Default LSA admin ID
        const db = require('../config/database');
        const connection = await db.getConnection();

        await connection.beginTransaction();

        // Update therapist status
        await connection.execute(
            'UPDATE therapists SET status = ?, approved_by = ?, approved_date = NOW() WHERE id = ?',
            ['approved', approvedBy, therapistId]
        );

        // Get therapist and spa details
        const [therapistData] = await connection.execute(`
            SELECT t.*, s.name as spa_name 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id 
            WHERE t.id = ?
        `, [therapistId]);

        if (therapistData.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Therapist not found'
            });
        }

        const therapist = therapistData[0];

        // Create notifications in database
        await connection.execute(
            `INSERT INTO notifications 
            (recipient_id, recipient_type, title, message, type, reference_id, reference_type, is_read) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                therapist.spa_id,
                'admin_spa',
                '✅ Therapist Approved!',
                `Great news! Therapist "${therapist.name}" has been approved and can now join your team. Welcome aboard!`,
                'approval',
                therapistId,
                'therapist'
            ]
        );

        await connection.execute(
            `INSERT INTO notifications 
            (recipient_id, recipient_type, title, message, type, reference_id, reference_type, is_read) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                approvedBy,
                'admin_lsa',
                '📋 Therapist Approved',
                `You approved therapist "${therapist.name}" for ${therapist.spa_name}. Action logged successfully.`,
                'approval',
                therapistId,
                'therapist'
            ]
        );

        await connection.commit();
        connection.release();

        // Emit real-time notifications
        const io = req.app.get('io');
        if (io) {
            const spaNotification = {
                recipient_id: therapist.spa_id,
                recipient_type: 'admin_spa',
                title: '✅ Therapist Approved!',
                message: `Great news! Therapist "${therapist.name}" has been approved and can now join your team. Welcome aboard!`,
                type: 'approval',
                reference_id: therapistId,
                reference_type: 'therapist'
            };

            const lsaNotification = {
                recipient_id: approvedBy,
                recipient_type: 'admin_lsa',
                title: '📋 Therapist Approved',
                message: `You approved therapist "${therapist.name}" for ${therapist.spa_name}. Action logged successfully.`,
                type: 'approval',
                reference_id: therapistId,
                reference_type: 'therapist'
            };

            io.to(`spa_${therapist.spa_id}`).emit('newNotification', spaNotification);
            io.to('lsa').emit('newNotification', lsaNotification);
            io.to('lsa').emit('therapistStatusUpdate', { therapistId, status: 'approved', therapist });
        }

        console.log(`✅ Therapist ${therapist.name} approved successfully`);

        res.json({
            success: true,
            message: 'Therapist approved successfully',
            data: {
                therapistId,
                status: 'approved',
                approvedBy,
                therapist: therapist.name
            }
        });

    } catch (error) {
        console.error('Approve therapist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve therapist',
            error: error.message
        });
    }
});

// POST /api/lsa/therapists/:id/reject - Reject therapist
router.post('/therapists/:id/reject', async (req, res) => {
    try {
        const therapistId = parseInt(req.params.id);
        const { reason, rejectedBy = 1 } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const db = require('../config/database');
        const connection = await db.getConnection();

        await connection.beginTransaction();

        // Update therapist status
        await connection.execute(
            'UPDATE therapists SET status = ?, reject_reason = ?, approved_by = ?, approved_date = NOW() WHERE id = ?',
            ['rejected', reason, rejectedBy, therapistId]
        );

        // Get therapist and spa details
        const [therapistData] = await connection.execute(`
            SELECT t.*, s.name as spa_name 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id 
            WHERE t.id = ?
        `, [therapistId]);

        if (therapistData.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Therapist not found'
            });
        }

        const therapist = therapistData[0];

        // Create notifications in database
        await connection.execute(
            `INSERT INTO notifications 
            (recipient_id, recipient_type, title, message, type, reference_id, reference_type, is_read) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                therapist.spa_id,
                'admin_spa',
                '❌ Therapist Application Rejected',
                `Unfortunately, therapist "${therapist.name}" was not approved. Reason: ${reason}. Please review and resubmit if possible.`,
                'rejection',
                therapistId,
                'therapist'
            ]
        );

        await connection.execute(
            `INSERT INTO notifications 
            (recipient_id, recipient_type, title, message, type, reference_id, reference_type, is_read) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                rejectedBy,
                'admin_lsa',
                '📋 Therapist Rejected',
                `You rejected therapist "${therapist.name}" for ${therapist.spa_name}. Reason: ${reason}`,
                'rejection',
                therapistId,
                'therapist'
            ]
        );

        await connection.commit();
        connection.release();

        // Emit real-time notifications
        const io = req.app.get('io');
        if (io) {
            const spaNotification = {
                recipient_id: therapist.spa_id,
                recipient_type: 'admin_spa',
                title: '❌ Therapist Application Rejected',
                message: `Unfortunately, therapist "${therapist.name}" was not approved. Reason: ${reason}. Please review and resubmit if possible.`,
                type: 'rejection',
                reference_id: therapistId,
                reference_type: 'therapist'
            };

            const lsaNotification = {
                recipient_id: rejectedBy,
                recipient_type: 'admin_lsa',
                title: '📋 Therapist Rejected',
                message: `You rejected therapist "${therapist.name}" for ${therapist.spa_name}. Reason: ${reason}`,
                type: 'rejection',
                reference_id: therapistId,
                reference_type: 'therapist'
            };

            io.to(`spa_${therapist.spa_id}`).emit('newNotification', spaNotification);
            io.to('lsa').emit('newNotification', lsaNotification);
            io.to('lsa').emit('therapistStatusUpdate', { therapistId, status: 'rejected', reason, therapist });
        }

        console.log(`❌ Therapist ${therapist.name} rejected: ${reason}`);

        res.json({
            success: true,
            message: 'Therapist rejected successfully',
            data: {
                therapistId,
                status: 'rejected',
                reason,
                rejectedBy,
                therapist: therapist.name
            }
        });

    } catch (error) {
        console.error('Reject therapist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject therapist',
            error: error.message
        });
    }
});

// GET /api/notifications/all - Get all notifications from database
router.get('/all', async (req, res) => {
    try {
        const db = require('../config/database');
        const connection = await db.getConnection();

        const [notifications] = await connection.execute(`
            SELECT 
                notification_id,
                recipient_type,
                recipient_id,
                notification_type,
                title,
                message,
                data,
                read_status,
                created_at
            FROM notifications 
            ORDER BY created_at DESC 
            LIMIT 100
        `);

        connection.release();

        // Parse JSON data field
        const processedNotifications = notifications.map(notification => ({
            ...notification,
            data: notification.data ? JSON.parse(notification.data) : null
        }));

        res.json({
            success: true,
            data: processedNotifications
        });

    } catch (error) {
        console.error('Get all notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications',
            error: error.message
        });
    }
});

// GET /api/notifications/therapist/:id - Get notifications for specific therapist
router.get('/therapist/:id', async (req, res) => {
    try {
        const therapistId = parseInt(req.params.id);
        const db = require('../config/database');
        const connection = await db.getConnection();

        const [notifications] = await connection.execute(`
            SELECT 
                notification_id,
                recipient_type,
                recipient_id,
                notification_type,
                title,
                message,
                data,
                read_status,
                created_at
            FROM notifications 
            WHERE JSON_EXTRACT(data, '$.therapist_id') = ? OR recipient_id = ?
            ORDER BY created_at DESC
        `, [therapistId, therapistId]);

        connection.release();

        // Parse JSON data field
        const processedNotifications = notifications.map(notification => ({
            ...notification,
            data: notification.data ? JSON.parse(notification.data) : null
        }));

        res.json({
            success: true,
            data: processedNotifications
        });

    } catch (error) {
        console.error('Get therapist notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get therapist notifications',
            error: error.message
        });
    }
});

// PUT /api/notifications/:id/mark-read - Mark notification as read
router.put('/:id/mark-read', async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const db = require('../config/database');
        const connection = await db.getConnection();

        await connection.execute(`
            UPDATE notifications 
            SET read_status = 1 
            WHERE notification_id = ?
        `, [notificationId]);

        connection.release();

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
});

module.exports = router;
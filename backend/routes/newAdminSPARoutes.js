const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/NotificationModel');
const ActivityLogModel = require('../models/ActivityLogModel');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/therapist-documents/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
        }
    }
});

// Get dynamic dashboard stats (Step 01)
router.get('/dashboard-stats', async (req, res) => {
    try {
        // For demo purposes, using spa_id = 1. In production, get from JWT token or session
        const spaId = 1;

        // Get approved therapists count
        const [approvedResult] = await db.execute(
            'SELECT COUNT(*) as count FROM therapists WHERE spa_id = ? AND status = ?',
            [spaId, 'approved']
        );

        // Get pending therapists count
        const [pendingResult] = await db.execute(
            'SELECT COUNT(*) as count FROM therapists WHERE spa_id = ? AND status = ?',
            [spaId, 'pending']
        );

        res.json({
            success: true,
            approved_therapists: approvedResult[0].count,
            pending_therapists: pendingResult[0].count
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics',
            approved_therapists: 0,
            pending_therapists: 0
        });
    }
});

// Get recent activity for today and yesterday (Step 01)
router.get('/recent-activity', async (req, res) => {
    try {
        // For demo purposes, using spa_id = 1. In production, get from JWT token or session
        const spaId = 1;

        // Get today and yesterday's dates
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Get recent activities (add, request, response)
        const [activities] = await db.execute(`
            SELECT id, name, nic, status, created_at, updated_at
            FROM therapists 
            WHERE spa_id = ? 
            AND status IN ('pending', 'approved', 'rejected')
            AND DATE(created_at) >= ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [spaId, yesterdayStr]);

        res.json(activities);

    } catch (error) {
        console.error('Recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activities',
            data: []
        });
    }
});

// Process payment - Enhanced (Step 02)
router.post('/process-payment', upload.single('slip'), async (req, res) => {
    try {
        // For demo purposes, using spa_id = 1. In production, get from JWT token or session
        const spaId = 1;
        const { type, amount, method, planId } = req.body;

        // Validate required fields
        if (!type || !amount || !method) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment information'
            });
        }

        let paymentData = {
            spa_id: spaId,
            type: type, // 'registration_fee' or 'annual_fee'
            amount: parseFloat(amount),
            method: method, // 'card' or 'bank_transfer'
            status: 'pending',
            created_at: new Date()
        };

        if (method === 'card') {
            // Handle card payment with PayHere integration
            const cardDetails = req.body.cardDetails;

            // In production, integrate with PayHere API
            // For now, simulate successful payment
            paymentData.status = 'paid';
            paymentData.payhere_order_id = 'ORDER_' + Date.now();
            paymentData.card_details = JSON.stringify({
                last4: cardDetails.cardNumber.slice(-4),
                holderName: cardDetails.holderName
            });

            // Insert payment record
            const [result] = await db.execute(
                'INSERT INTO payments (spa_id, type, amount, method, status, payhere_order_id, card_details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [paymentData.spa_id, paymentData.type, paymentData.amount, paymentData.method, paymentData.status, paymentData.payhere_order_id, paymentData.card_details, paymentData.created_at]
            );

            res.json({
                success: true,
                message: 'Payment processed successfully',
                paymentId: result.insertId,
                orderId: paymentData.payhere_order_id
            });

        } else if (method === 'bank_transfer') {
            // Handle bank transfer with file upload
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Bank transfer slip is required'
                });
            }

            paymentData.slip_path = req.file.path;
            paymentData.status = 'pending'; // Requires admin approval

            // Insert payment record
            const [result] = await db.execute(
                'INSERT INTO payments (spa_id, type, amount, method, status, slip_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [paymentData.spa_id, paymentData.type, paymentData.amount, paymentData.method, paymentData.status, paymentData.slip_path, paymentData.created_at]
            );

            res.json({
                success: true,
                message: 'Bank transfer slip uploaded successfully. Payment pending approval.',
                paymentId: result.insertId
            });
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message
        });
    }
});

// Get notification history (Step 04)
router.get('/notification-history', async (req, res) => {
    try {
        // For demo purposes, using spa_id = 1. In production, get from JWT token or session
        const spaId = 1;

        // Get approved and rejected therapist history with dates
        const [history] = await db.execute(`
            SELECT id, name, nic, status, created_at, updated_at, reject_reason
            FROM therapists 
            WHERE spa_id = ? 
            AND status IN ('approved', 'rejected')
            ORDER BY updated_at DESC, created_at DESC
        `, [spaId]);

        res.json(history);

    } catch (error) {
        console.error('Notification history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notification history',
            data: []
        });
    }
});

// Get spa dashboard data (existing route - keeping for compatibility)
router.get('/dashboard/:spaId', async (req, res) => {
    try {
        const spaId = req.params.spaId;

        // Get spa basic info
        const [spa] = await db.execute('SELECT * FROM spas WHERE id = ?', [spaId]);

        if (spa.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Spa not found'
            });
        }

        // Get therapist statistics
        const [therapistStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_therapists,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_therapists,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_therapists,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_therapists
            FROM therapists 
            WHERE spa_id = ?
        `, [spaId]);

        // Get recent activities for this spa
        const recentActivities = await ActivityLogModel.getEntityActivities('spa', spaId);

        // Get unread notifications for this spa
        const unreadCount = await NotificationModel.getUnreadCount('spa', spaId);

        res.json({
            success: true,
            spa: spa[0],
            stats: therapistStats[0],
            recent_activities: recentActivities.slice(0, 10), // Latest 10
            unread_notifications: unreadCount
        });
    } catch (error) {
        console.error('Error fetching spa dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch spa dashboard data'
        });
    }
});

// Get therapists for a specific spa
router.get('/spas/:spaId/therapists', async (req, res) => {
    try {
        const spaId = req.params.spaId;
        const { status = 'all' } = req.query;

        let query = 'SELECT * FROM therapists WHERE spa_id = ?';
        const params = [spaId];

        if (status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [therapists] = await db.execute(query, params);

        // Parse JSON fields
        const enrichedTherapists = therapists.map(therapist => ({
            ...therapist,
            specializations: JSON.parse(therapist.specializations || '[]'),
            working_history: JSON.parse(therapist.working_history || '[]')
        }));

        res.json({
            success: true,
            therapists: enrichedTherapists
        });
    } catch (error) {
        console.error('Error fetching spa therapists:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch spa therapists'
        });
    }
});

// Add new therapist request
router.post('/spas/:spaId/therapists', upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
    { name: 'medical_certificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const spaId = req.params.spaId;
        const {
            name, email, phone, address,
            specializations, experience_years
        } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !address) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, phone, and address are required'
            });
        }

        // Process uploaded files
        const certificatePath = req.files['certificate'] ? req.files['certificate'][0].path : null;
        const profileImagePath = req.files['profile_image'] ? req.files['profile_image'][0].path : null;
        const medicalCertPath = req.files['medical_certificate'] ? req.files['medical_certificate'][0].path : null;

        // Parse specializations if it's a string
        let parsedSpecializations = [];
        try {
            parsedSpecializations = typeof specializations === 'string'
                ? JSON.parse(specializations)
                : (Array.isArray(specializations) ? specializations : []);
        } catch (e) {
            parsedSpecializations = [specializations].filter(Boolean);
        }

        // Create initial working history entry
        const workingHistory = [{
            spa_id: parseInt(spaId),
            start_date: new Date().toISOString().split('T')[0],
            end_date: null,
            position: 'Therapist',
            experience_gained: parseInt(experience_years) || 0,
            status: 'pending'
        }];

        // Insert therapist
        const [result] = await db.execute(`
            INSERT INTO therapists (
                spa_id, name, email, phone, address, 
                specializations, experience_years, status,
                certificate_path, working_history, current_spa_id, total_experience_years
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
        `, [
            spaId, name, email, phone, address,
            JSON.stringify(parsedSpecializations),
            parseInt(experience_years) || 0,
            certificatePath,
            JSON.stringify(workingHistory),
            spaId,
            parseInt(experience_years) || 0
        ]);

        const therapistId = result.insertId;

        // Get spa details for notifications
        const [spa] = await db.execute('SELECT * FROM spas WHERE id = ?', [spaId]);

        // Log activity
        await ActivityLogModel.logActivity({
            entity_type: 'therapist',
            entity_id: therapistId,
            action: 'created',
            description: `New therapist ${name} added to ${spa[0].name} - pending LSA approval`,
            actor_type: 'spa',
            actor_id: parseInt(spaId),
            actor_name: spa[0].name,
            new_status: 'pending'
        });

        // Create notification for LSA
        await NotificationModel.createNotification({
            recipient_type: 'lsa',
            recipient_id: 1, // LSA admin
            title: 'New Therapist Application',
            message: `${name} from ${spa[0].name} requires approval for registration`,
            type: 'warning',
            related_entity_type: 'therapist',
            related_entity_id: therapistId
        });

        // Create confirmation notification for spa
        await NotificationModel.createNotification({
            recipient_type: 'spa',
            recipient_id: parseInt(spaId),
            title: 'Therapist Application Submitted',
            message: `${name} application has been submitted to LSA for approval`,
            type: 'info',
            related_entity_type: 'therapist',
            related_entity_id: therapistId
        });

        res.status(201).json({
            success: true,
            message: 'Therapist application submitted successfully',
            therapist_id: therapistId,
            data: {
                name,
                email,
                status: 'pending',
                submitted_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error adding therapist:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add therapist application'
        });
    }
});

// Get notifications for spa
router.get('/spas/:spaId/notifications', async (req, res) => {
    try {
        const spaId = req.params.spaId;
        const { unread_only = false } = req.query;

        const notifications = await NotificationModel.getNotificationsByRecipient(
            'spa',
            parseInt(spaId),
            unread_only === 'true'
        );

        res.json({
            success: true,
            notifications,
            total: notifications.length
        });
    } catch (error) {
        console.error('Error fetching spa notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications'
        });
    }
});

// Mark spa notification as read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        await NotificationModel.markAsRead(req.params.id);

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});

module.exports = router;
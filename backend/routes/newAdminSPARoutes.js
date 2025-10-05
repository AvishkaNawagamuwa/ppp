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

// Get spa dashboard data
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
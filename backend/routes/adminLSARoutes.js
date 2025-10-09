const express = require('express');
const router = express.Router();
const SpaModel = require('../models/SpaModel');
const TherapistModel = require('../models/TherapistModel');
const { therapistUpload } = require('../middleware/upload');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== ADMIN LSA DASHBOARD ROUTES ====================

/**
 * @route   GET /api/lsa/dashboard
 * @desc    Get AdminLSA dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    try {
        const [spaStats, therapistStats] = await Promise.all([
            SpaModel.getAdminStats(),
            TherapistModel.getAdminStats()
        ]);

        const dashboardData = {
            spa_statistics: spaStats,
            therapist_statistics: therapistStats,
            recent_activities: await SpaModel.getRecentActivities(10),
            system_notifications: await SpaModel.getSystemNotifications()
        };

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('AdminLSA dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/dashboard/spas-count
 * @desc    Get count of verified spas
 * @access  Private (Admin)
 */
router.get('/dashboard/spas-count', asyncHandler(async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COUNT(*) as verified_count FROM spas WHERE status = 'verified'`
        );

        res.json({
            success: true,
            data: {
                verified_count: rows[0].verified_count
            }
        });

    } catch (error) {
        console.error('Get spas count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch spas count',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/dashboard/therapists-count
 * @desc    Get count of approved therapists
 * @access  Private (Admin)
 */
router.get('/dashboard/therapists-count', asyncHandler(async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COUNT(*) as approved_count FROM therapists WHERE status = 'approved'`
        );

        res.json({
            success: true,
            data: {
                approved_count: rows[0].approved_count
            }
        });

    } catch (error) {
        console.error('Get therapists count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch therapists count',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/dashboard/recent-activity
 * @desc    Get recent spa and therapist activity from today and yesterday
 * @access  Private (Admin)
 */
router.get('/dashboard/recent-activity', asyncHandler(async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                al.id,
                al.entity_type,
                al.entity_id,
                al.action,
                al.description,
                al.old_status,
                al.new_status,
                al.created_at,
                CASE 
                    WHEN al.entity_type = 'therapist' THEN CONCAT(COALESCE(t.first_name, t.name), ' ', COALESCE(t.last_name, ''))
                    WHEN al.entity_type = 'spa' THEN s.name
                    ELSE 'System'
                END as entity_name
            FROM activity_logs al
            LEFT JOIN therapists t ON al.entity_type = 'therapist' AND al.entity_id = t.id
            LEFT JOIN spas s ON al.entity_type = 'spa' AND al.entity_id = s.id
            WHERE al.created_at >= CURDATE() - INTERVAL 1 DAY
            ORDER BY al.created_at DESC
            LIMIT 20
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activity',
            error: error.message
        });
    }
}));

// ==================== SPA MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/lsa/spas
 * @desc    Get all spas with filtering and pagination
 * @access  Private (Admin)
 */
router.get('/spas', asyncHandler(async (req, res) => {
    try {
        const {
            status,
            verification_status,
            city,
            spa_type,
            page = 1,
            limit = 10,
            search
        } = req.query;

        const filters = {
            status,
            verification_status,
            city,
            spa_type,
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const spas = await SpaModel.getAllSpas(filters);

        res.json({
            success: true,
            data: spas
        });

    } catch (error) {
        console.error('Get all spas error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch spas',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/spas/:spaId
 * @desc    Get detailed spa information
 * @access  Private (Admin)
 */
router.get('/spas/:spaId', asyncHandler(async (req, res) => {
    try {
        const { spaId } = req.params;
        const spa = await SpaModel.getSpaById(spaId);

        if (!spa) {
            return res.status(404).json({
                success: false,
                message: 'Spa not found'
            });
        }

        res.json({
            success: true,
            data: spa
        });

    } catch (error) {
        console.error('Get spa details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch spa details',
            error: error.message
        });
    }
}));

/**
 * @route   PUT /api/lsa/spas/:spaId/verify
 * @desc    Approve or reject spa verification
 * @access  Private (Admin)
 */
router.put('/spas/:spaId/verify', asyncHandler(async (req, res) => {
    try {
        const { spaId } = req.params;
        const { action, admin_comments } = req.body; // action: 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "approve" or "reject"'
            });
        }

        const result = await SpaModel.updateSpaStatus(spaId, action, admin_comments);

        res.json({
            success: true,
            message: `Spa ${action}d successfully`,
            data: result
        });

    } catch (error) {
        console.error('Spa verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update spa verification status',
            error: error.message
        });
    }
}));

/**
 * @route   PUT /api/lsa/spas/:spaId/status
 * @desc    Update spa status (active/inactive/suspended)
 * @access  Private (Admin)
 */
router.put('/spas/:spaId/status', asyncHandler(async (req, res) => {
    try {
        const { spaId } = req.params;
        const { status, reason } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "active", "inactive", or "suspended"'
            });
        }

        const result = await SpaModel.updateSpaGeneralStatus(spaId, status, reason);

        res.json({
            success: true,
            message: 'Spa status updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Update spa status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update spa status',
            error: error.message
        });
    }
}));

// ==================== THERAPIST MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/lsa/therapists
 * @desc    Get all therapists with filtering and pagination
 * @access  Private (Admin)
 */
router.get('/therapists', asyncHandler(async (req, res) => {
    try {
        const {
            status,
            spa_id,
            specialization,
            experience_level,
            page = 1,
            limit = 10,
            search
        } = req.query;

        const filters = {
            status,
            spa_id,
            specialization,
            experience_level,
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const therapists = await TherapistModel.getAllTherapists(filters);

        res.json({
            success: true,
            data: therapists
        });

    } catch (error) {
        console.error('Get all therapists error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch therapists',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/therapists/:therapistId
 * @desc    Get detailed therapist information
 * @access  Private (Admin)
 */
router.get('/therapists/:therapistId', asyncHandler(async (req, res) => {
    try {
        const { therapistId } = req.params;
        const therapist = await TherapistModel.getTherapistById(therapistId);

        if (!therapist) {
            return res.status(404).json({
                success: false,
                message: 'Therapist not found'
            });
        }

        res.json({
            success: true,
            data: therapist
        });

    } catch (error) {
        console.error('Get therapist details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch therapist details',
            error: error.message
        });
    }
}));

/**
 * @route   POST /api/lsa/therapists
 * @desc    Add new therapist (from AdminLSA)
 * @access  Private (Admin)
 */
router.post('/therapists', therapistUpload, asyncHandler(async (req, res) => {
    try {
        const therapistData = {
            spa_id: req.body.spa_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            nic_number: req.body.nic_number,
            email: req.body.email,
            phone: req.body.phone,
            date_of_birth: req.body.date_of_birth,
            gender: req.body.gender,
            address: req.body.address,
            city: req.body.city,
            postal_code: req.body.postal_code,
            specialization: req.body.specialization ? JSON.parse(req.body.specialization) : [],
            experience_years: parseInt(req.body.experience_years),
            experience_level: req.body.experience_level,
            languages_spoken: req.body.languages_spoken ? JSON.parse(req.body.languages_spoken) : [],
            certifications: req.body.certifications ? JSON.parse(req.body.certifications) : [],
            hourly_rate: parseFloat(req.body.hourly_rate),
            availability: req.body.availability ? JSON.parse(req.body.availability) : {},
            bio: req.body.bio,
            added_by_admin: true
        };

        // Handle file uploads
        if (req.files) {
            if (req.files.nic_attachment) therapistData.nic_attachment = req.files.nic_attachment[0].path;
            if (req.files.medical_certificate) therapistData.medical_certificate = req.files.medical_certificate[0].path;
            if (req.files.spa_certificate) therapistData.spa_certificate = req.files.spa_certificate[0].path;
            if (req.files.therapist_image) therapistData.therapist_image = req.files.therapist_image[0].path;
        }

        const result = await TherapistModel.createTherapist(therapistData);

        res.status(201).json({
            success: true,
            message: 'Therapist added successfully',
            data: {
                therapist_id: result.therapist_id,
                status: result.status
            }
        });

    } catch (error) {
        console.error('Add therapist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add therapist',
            error: error.message
        });
    }
}));

/**
 * @route   PUT /api/lsa/therapists/:therapistId/approve
 * @desc    Approve therapist request
 * @access  Private (Admin)
 */
router.put('/therapists/:therapistId/approve', asyncHandler(async (req, res) => {
    try {
        const { therapistId } = req.params;
        const { admin_comments } = req.body;

        const result = await TherapistModel.approveTherapist(therapistId, admin_comments);

        res.json({
            success: true,
            message: 'Therapist approved successfully',
            data: result
        });

    } catch (error) {
        console.error('Approve therapist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve therapist',
            error: error.message
        });
    }
}));

/**
 * @route   PUT /api/lsa/therapists/:therapistId/reject
 * @desc    Reject therapist request
 * @access  Private (Admin)
 */
router.put('/therapists/:therapistId/reject', asyncHandler(async (req, res) => {
    try {
        const { therapistId } = req.params;
        const { rejection_reason, admin_comments } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const result = await TherapistModel.rejectTherapist(therapistId, rejection_reason, admin_comments);

        res.json({
            success: true,
            message: 'Therapist rejected successfully',
            data: result
        });

    } catch (error) {
        console.error('Reject therapist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject therapist',
            error: error.message
        });
    }
}));

/**
 * @route   PUT /api/lsa/therapists/:therapistId/status
 * @desc    Update therapist status
 * @access  Private (Admin)
 */
router.put('/therapists/:therapistId/status', asyncHandler(async (req, res) => {
    try {
        const { therapistId } = req.params;
        const { status, reason } = req.body;

        if (!['active', 'inactive', 'suspended', 'terminated'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const result = await TherapistModel.updateTherapistStatus(therapistId, status, reason);

        res.json({
            success: true,
            message: 'Therapist status updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Update therapist status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update therapist status',
            error: error.message
        });
    }
}));

// ==================== REPORTS AND ANALYTICS ROUTES ====================

/**
 * @route   GET /api/lsa/reports/spas
 * @desc    Get spa analytics and reports
 * @access  Private (Admin)
 */
router.get('/reports/spas', asyncHandler(async (req, res) => {
    try {
        const { period = '30', type = 'overview' } = req.query;

        const reports = await SpaModel.getSpaReports({
            period: parseInt(period),
            type
        });

        res.json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error('Get spa reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch spa reports',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/reports/therapists
 * @desc    Get therapist analytics and reports
 * @access  Private (Admin)
 */
router.get('/reports/therapists', asyncHandler(async (req, res) => {
    try {
        const { period = '30', type = 'overview' } = req.query;

        const reports = await TherapistModel.getTherapistReports({
            period: parseInt(period),
            type
        });

        res.json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error('Get therapist reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch therapist reports',
            error: error.message
        });
    }
}));

// ==================== SYSTEM MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/lsa/activity-logs
 * @desc    Get system-wide activity logs
 * @access  Private (Admin)
 */
router.get('/activity-logs', asyncHandler(async (req, res) => {
    try {
        const {
            user_type,
            action_type,
            entity_type,
            start_date,
            end_date,
            page = 1,
            limit = 50
        } = req.query;

        const filters = {
            user_type,
            action_type,
            entity_type,
            start_date,
            end_date,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const logs = await SpaModel.getSystemLogs(filters);

        res.json({
            success: true,
            data: logs
        });

    } catch (error) {
        console.error('Get system logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system logs',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/notifications
 * @desc    Get system notifications
 * @access  Private (Admin)
 */
router.get('/notifications', asyncHandler(async (req, res) => {
    try {
        const { type, priority, read_status } = req.query;

        const notifications = await SpaModel.getAdminNotifications({
            type,
            priority,
            read_status
        });

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Get admin notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/lsa/notifications/unread
 * @desc    Get unread notification count
 * @access  Private (Admin)
 */
router.get('/notifications/unread', asyncHandler(async (req, res) => {
    try {
        const count = await SpaModel.getUnreadNotificationCount();

        res.json({
            success: true,
            data: { count }
        });

    } catch (error) {
        console.error('Get unread notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread notification count',
            error: error.message
        });
    }
}));

// ==================== ERROR HANDLING ====================

// Global error handler for this router
router.use((error, req, res, next) => {
    console.error('AdminLSA Routes Error:', error);

    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 50MB.'
        });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many files uploaded.'
        });
    }

    if (error.message.includes('file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// ==================== ENHANCED FEATURES ====================

// Middleware to verify AdminLSA authentication
const verifyAdminLSA = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Verify user exists and is AdminLSA
        const [user] = await db.execute(
            'SELECT * FROM admin_users WHERE id = ? AND role = "admin_lsa" AND is_active = 1',
            [decoded.id]
        );

        if (user.length === 0) {
            return res.status(403).json({ success: false, error: 'Access denied. AdminLSA role required.' });
        }

        req.user = user[0];
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token.' });
    }
};

// Enhanced Dashboard Statistics
router.get('/enhanced/dashboard/stats', verifyAdminLSA, async (req, res) => {
    try {
        const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM spas WHERE status = 'pending') as pending_spas,
        (SELECT COUNT(*) FROM spas WHERE status = 'verified') as verified_spas,
        (SELECT COUNT(*) FROM spas WHERE status = 'rejected') as rejected_spas,
        (SELECT COUNT(*) FROM spas WHERE blacklist_reason IS NOT NULL) as blacklisted_spas,
        (SELECT COUNT(*) FROM therapists WHERE status = 'pending') as pending_therapists,
        (SELECT COUNT(*) FROM therapists WHERE status = 'approved') as approved_therapists,
        (SELECT COUNT(*) FROM admin_users WHERE role = 'government_officer' AND is_active = 1) as active_officers,
        (SELECT COUNT(*) FROM payments WHERE status = 'pending' AND payment_method = 'bank_transfer') as pending_bank_transfers,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND MONTH(created_at) = MONTH(CURDATE())) as monthly_revenue
    `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Error fetching enhanced dashboard stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
    }
});

// Financial Dashboard - Monthly Reports
router.get('/enhanced/financial/monthly', verifyAdminLSA, async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const [financialData] = await db.execute(`
      SELECT 
        MONTH(created_at) as month,
        SUM(CASE WHEN payment_type = 'registration' THEN amount ELSE 0 END) as registration_fees,
        SUM(CASE WHEN payment_type = 'annual' THEN amount ELSE 0 END) as annual_fees,
        SUM(CASE WHEN payment_type = 'monthly' THEN amount ELSE 0 END) as monthly_fees,
        COUNT(*) as total_payments
      FROM payments 
      WHERE status = 'completed' AND YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      ORDER BY month
    `, [year]);

        // Fill in missing months with zero values
        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            const existingData = financialData.find(d => d.month === month);
            return existingData || {
                month,
                registration_fees: 0,
                annual_fees: 0,
                monthly_fees: 0,
                total_payments: 0
            };
        });

        res.json({
            success: true,
            data: {
                year: parseInt(year),
                monthly_data: monthlyData,
                summary: {
                    total_registration: monthlyData.reduce((sum, m) => sum + parseFloat(m.registration_fees || 0), 0),
                    total_annual: monthlyData.reduce((sum, m) => sum + parseFloat(m.annual_fees || 0), 0),
                    total_monthly: monthlyData.reduce((sum, m) => sum + parseFloat(m.monthly_fees || 0), 0),
                    total_payments: monthlyData.reduce((sum, m) => sum + (m.total_payments || 0), 0)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching financial data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch financial data' });
    }
});

// Enhanced Spa Management - Blacklist functionality
router.post('/enhanced/spas/:id/blacklist', verifyAdminLSA, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, error: 'Blacklist reason is compulsory' });
        }

        await db.execute(`
      UPDATE spas SET 
        blacklist_reason = ?,
        blacklisted_at = NOW(),
        status = 'rejected'
      WHERE id = ?
    `, [reason, id]);

        res.json({ success: true, message: 'Spa blacklisted successfully' });
    } catch (error) {
        console.error('Error blacklisting spa:', error);
        res.status(500).json({ success: false, error: 'Failed to blacklist spa' });
    }
});

// Third-Party Login Management
router.get('/enhanced/third-party/accounts', verifyAdminLSA, async (req, res) => {
    try {
        const [accounts] = await db.execute(`
      SELECT id, username, email, full_name, department, is_temporary, expires_at, created_at, last_login, is_active
      FROM admin_users 
      WHERE role = 'government_officer'
      ORDER BY created_at DESC
    `);

        res.json({ success: true, data: accounts });
    } catch (error) {
        console.error('Error fetching third-party accounts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch accounts' });
    }
});

// Create temporary third-party login
router.post('/enhanced/third-party/create', verifyAdminLSA, async (req, res) => {
    try {
        const { username, email, full_name, department, duration_hours = 8 } = req.body;

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Calculate expiry time
        const expiresAt = new Date(Date.now() + (duration_hours * 60 * 60 * 1000));

        const [result] = await db.execute(`
      INSERT INTO admin_users (
        username, email, password_hash, role, full_name, department, 
        is_temporary, expires_at, created_by, is_active
      ) VALUES (?, ?, ?, 'government_officer', ?, ?, 1, ?, ?, 1)
    `, [username, email, hashedPassword, full_name, department, expiresAt, req.user.id]);

        res.status(201).json({
            success: true,
            message: 'Temporary account created successfully',
            data: {
                id: result.insertId,
                username,
                temporary_password: tempPassword,
                expires_at: expiresAt,
                login_url: '/third-party-login'
            }
        });
    } catch (error) {
        console.error('Error creating third-party account:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, error: 'Username or email already exists' });
        } else {
            res.status(500).json({ success: false, error: 'Failed to create account' });
        }
    }
});

// Delete third-party account
router.delete('/enhanced/third-party/:id', verifyAdminLSA, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(`
      DELETE FROM admin_users 
      WHERE id = ? AND role = 'government_officer'
    `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting third-party account:', error);
        res.status(500).json({ success: false, error: 'Failed to delete account' });
    }
});

// Bank Transfer Approval
router.get('/enhanced/payments/bank-transfers', verifyAdminLSA, async (req, res) => {
    try {
        const [payments] = await db.execute(`
      SELECT p.*, s.name as spa_name, s.reference_number, s.owner_fname, s.owner_lname
      FROM payments p
      JOIN spas s ON p.spa_id = s.id
      WHERE p.payment_method = 'bank_transfer' AND p.bank_transfer_approved = 0
      ORDER BY p.created_at DESC
    `);

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching bank transfers:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bank transfers' });
    }
});

// Approve bank transfer
router.post('/enhanced/payments/:id/approve', verifyAdminLSA, async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        await db.execute(`
      UPDATE payments SET 
        bank_transfer_approved = 1,
        status = 'completed',
        approval_date = NOW(),
        approved_by = ?
      WHERE id = ? AND payment_method = 'bank_transfer'
    `, [req.user.full_name, id]);

        res.json({ success: true, message: 'Bank transfer approved successfully' });
    } catch (error) {
        console.error('Error approving bank transfer:', error);
        res.status(500).json({ success: false, error: 'Failed to approve bank transfer' });
    }
});

// ==================== THIRD-PARTY GOVERNMENT OFFICER ROUTES ====================

/**
 * @route   POST /api/lsa/third-party/create
 * @desc    Create government officer account
 * @access  Private (Admin)
 */
router.post('/third-party/create', asyncHandler(async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Check if username already exists
        const [existingUser] = await db.execute(
            'SELECT id FROM third_party_users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }

        // Hash the provided password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create government officer account
        const [result] = await db.execute(`
            INSERT INTO third_party_users (
                username, password_hash, full_name, role, 
                created_by, is_active
            ) VALUES (?, ?, ?, 'government_officer', ?, true)
        `, [
            username,
            hashedPassword,
            `Officer ${username}`,
            1 // Default admin ID
        ]);

        // Calculate expiration time (8 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 8);

        res.status(201).json({
            success: true,
            message: 'Government officer account created successfully',
            data: {
                id: result.insertId,
                username,
                department: 'Government Office',
                expiresAt,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Create government officer error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create government officer account'
        });
    }
}));

/**
 * @route   GET /api/lsa/third-party/accounts
 * @desc    Get all government officer accounts
 * @access  Private (Admin)
 */
router.get('/third-party/accounts', asyncHandler(async (req, res) => {
    try {
        const [accounts] = await db.execute(`
            SELECT 
                id, username, full_name, is_active, 
                created_at, last_login,
                CASE 
                    WHEN is_active = false THEN 'inactive'
                    WHEN last_login IS NULL THEN 'never_logged_in'
                    ELSE 'active'
                END as status
            FROM third_party_users 
            WHERE role = 'government_officer'
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: accounts
        });

    } catch (error) {
        console.error('Fetch government officer accounts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch accounts'
        });
    }
}));

/**
 * @route   DELETE /api/lsa/third-party/account/:id
 * @desc    Delete government officer account
 * @access  Private (Admin)
 */
router.delete('/third-party/account/:id', asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Check if account exists
        const [account] = await db.execute(
            'SELECT username FROM third_party_users WHERE id = ? AND role = "government_officer"',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        // Delete the account
        await db.execute(
            'DELETE FROM third_party_users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: `Government officer account '${account[0].username}' deleted successfully`
        });

    } catch (error) {
        console.error('Delete government officer account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
}));

module.exports = router;
const express = require('express');
const router = express.Router();
const SpaModel = require('../models/SpaModel');
const TherapistModel = require('../models/TherapistModel');
const { therapistUpload } = require('../middleware/upload');

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
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ==================== ENHANCED NOTIFICATION SYSTEM ====================

// GET /api/lsa/notifications/history - Get all therapist and spa action history
router.get('/notifications/history', async (req, res) => {
    try {
        const { limit = 100, offset = 0, type = 'all', status = 'all' } = req.query;

        let allNotifications = [];

        // Get therapist history if requested
        if (type === 'all' || type === 'therapist') {
            let therapistQuery = `
                SELECT 
                    t.id as therapist_id,
                    t.spa_id,
                    s.name as spa_name,
                    t.first_name,
                    t.last_name,
                    t.nic_number as nic,
                    t.email,
                    t.phone,
                    t.specialization,
                    t.status,
                    t.reject_reason as rejection_reason,
                    t.terminate_reason as termination_reason,
                    t.resign_reason as resignation_reason,
                    t.approved_by,
                    t.approved_date,
                    t.resign_date,
                    t.created_at,
                    t.updated_at,
                    'therapist' as entity_type,
                    CASE 
                        WHEN t.status = 'approved' THEN 'Therapist Approved'
                        WHEN t.status = 'rejected' THEN 'Therapist Rejected'
                        WHEN t.status = 'pending' THEN 'New Therapist Registration'
                        WHEN t.status = 'resigned' THEN 'Therapist Resigned'
                        WHEN t.status = 'terminated' THEN 'Therapist Terminated'
                        ELSE 'Therapist Status Update'
                    END as action_title,
                    CASE 
                        WHEN t.status = 'approved' THEN CONCAT('Therapist ', t.first_name, ' ', t.last_name, ' has been approved')
                        WHEN t.status = 'rejected' THEN CONCAT('Therapist ', t.first_name, ' ', t.last_name, ' has been rejected')
                        WHEN t.status = 'pending' THEN CONCAT('New therapist registration from ', t.first_name, ' ', t.last_name)
                        WHEN t.status = 'resigned' THEN CONCAT('Therapist ', t.first_name, ' ', t.last_name, ' has resigned')
                        WHEN t.status = 'terminated' THEN CONCAT('Therapist ', t.first_name, ' ', t.last_name, ' has been terminated')
                        ELSE CONCAT('Status update for therapist ', t.first_name, ' ', t.last_name)
                    END as action_message,
                    t.updated_at as action_date
                FROM therapists t
                LEFT JOIN spas s ON t.spa_id = s.id
                WHERE 1=1
            `;

            const therapistParams = [];
            if (status !== 'all') {
                therapistQuery += ' AND t.status = ?';
                therapistParams.push(status);
            }

            therapistQuery += ' ORDER BY t.updated_at DESC';

            const [therapistResults] = await db.execute(therapistQuery, therapistParams);
            allNotifications = allNotifications.concat(therapistResults);
        }

        // Get spa history if requested
        if (type === 'all' || type === 'spa') {
            let spaQuery = `
                SELECT 
                    NULL as therapist_id,
                    s.id as spa_id,
                    s.name as spa_name,
                    s.owner_fname as first_name,
                    s.owner_lname as last_name,
                    NULL as nic,
                    s.email,
                    s.phone,
                    NULL as specialization,
                    s.status,
                    s.reject_reason as rejection_reason,
                    NULL as termination_reason,
                    NULL as resignation_reason,
                    s.approved_by,
                    s.approved_date,
                    NULL as resign_date,
                    s.created_at,
                    s.updated_at,
                    'spa' as entity_type,
                    CASE 
                        WHEN s.status = 'verified' THEN 'Spa Verified'
                        WHEN s.status = 'rejected' THEN 'Spa Rejected'
                        WHEN s.status = 'pending' THEN 'New Spa Registration'
                        ELSE 'Spa Status Update'
                    END as action_title,
                    CASE 
                        WHEN s.status = 'verified' THEN CONCAT('Spa "', s.name, '" has been verified')
                        WHEN s.status = 'rejected' THEN CONCAT('Spa "', s.name, '" has been rejected')
                        WHEN s.status = 'pending' THEN CONCAT('New spa registration: "', s.name, '"')
                        ELSE CONCAT('Status update for spa "', s.name, '"')
                    END as action_message,
                    s.updated_at as action_date
                FROM spas s
                WHERE 1=1
            `;

            const spaParams = [];
            if (status !== 'all') {
                spaQuery += ' AND s.status = ?';
                spaParams.push(status);
            }

            spaQuery += ' ORDER BY s.updated_at DESC';

            const [spaResults] = await db.execute(spaQuery, spaParams);
            allNotifications = allNotifications.concat(spaResults);
        }

        // Sort all notifications by action_date descending
        allNotifications.sort((a, b) => new Date(b.action_date) - new Date(a.action_date));

        // Apply pagination
        const total = allNotifications.length;
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

        console.log(`📊 Retrieved ${paginatedNotifications.length} notification history records (${total} total)`);

        res.json({
            success: true,
            data: paginatedNotifications,
            pagination: {
                total: total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: total > endIndex
            }
        });

    } catch (error) {
        console.error('❌ Error fetching notification history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification history',
            error: error.message
        });
    }
});

// GET /api/lsa/notifications/summary - Get notification summary statistics
router.get('/notifications/summary', async (req, res) => {
    try {
        // Get therapist statistics
        const [therapistStats] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as \`pending\`,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
                COUNT(CASE WHEN status = 'resigned' THEN 1 END) as resigned,
                COUNT(CASE WHEN status = 'terminated' THEN 1 END) as \`terminated\`
            FROM therapists
        `);

        // Get spa statistics  
        const [spaStats] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as \`pending\`,
                COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
            FROM spas
        `);

        // Get recent activity counts (simplified to avoid cross join)
        const [therapistActivity] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as therapist_actions_today,
                COUNT(CASE WHEN updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as therapist_actions_week
            FROM therapists
        `);

        const [spaActivity] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as spa_actions_today,
                COUNT(CASE WHEN updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as spa_actions_week
            FROM spas
        `);

        const combinedActivity = {
            therapist_actions_today: therapistActivity[0].therapist_actions_today,
            spa_actions_today: spaActivity[0].spa_actions_today,
            therapist_actions_week: therapistActivity[0].therapist_actions_week,
            spa_actions_week: spaActivity[0].spa_actions_week
        };

        res.json({
            success: true,
            data: {
                therapists: therapistStats[0],
                spas: spaStats[0],
                activity: combinedActivity
            }
        });

    } catch (error) {
        console.error('❌ Error fetching notification summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification summary',
            error: error.message
        });
    }
});

// GET /api/lsa/notifications/entity/:type/:id - Get specific entity notification history
router.get('/notifications/entity/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;

        if (!['therapist', 'spa'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid entity type. Must be "therapist" or "spa"'
            });
        }

        let query;
        let params = [id];

        if (type === 'therapist') {
            query = `
                SELECT 
                    t.id as therapist_id,
                    t.spa_id,
                    s.name as spa_name,
                    t.first_name,
                    t.last_name,
                    t.nic_number as nic,
                    t.email,
                    t.phone,
                    t.specialization,
                    t.status,
                    t.reject_reason as rejection_reason,
                    t.terminate_reason as termination_reason,
                    t.resign_reason as resignation_reason,
                    t.approved_by,
                    t.approved_date,
                    t.resign_date,
                    t.created_at,
                    t.updated_at,
                    'therapist' as entity_type
                FROM therapists t
                LEFT JOIN spas s ON t.spa_id = s.id
                WHERE t.id = ?
            `;
        } else {
            query = `
                SELECT 
                    s.id as spa_id,
                    s.name as spa_name,
                    s.owner_fname as first_name,
                    s.owner_lname as last_name,
                    NULL as nic,
                    s.email,
                    s.phone,
                    s.status,
                    s.reject_reason as rejection_reason,
                    s.approved_by,
                    s.approved_date,
                    s.created_at,
                    s.updated_at,
                    'spa' as entity_type
                FROM spas s
                WHERE s.id = ?
            `;
        }

        const [result] = await db.execute(query, params);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`
            });
        }

        res.json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error(`❌ Error fetching ${req.params.type} details:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch ${req.params.type} details`,
            error: error.message
        });
    }
});

module.exports = router;
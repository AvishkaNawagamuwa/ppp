const express = require('express');
const router = express.Router();
const db = require('../config/database');
const ActivityLogModel = require('../models/ActivityLogModel');

// Simple authentication middleware for third-party users
const thirdPartyAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // For demo purposes, accept any token that starts with 'demo-token-'
    if (token && token.startsWith('demo-token-')) {
        req.user = {
            id: 1,
            username: 'demo_officer',
            role: 'government_officer'
        };
        next();
    } else {
        res.status(401).json({
            success: false,
            error: 'Access denied. Invalid token.'
        });
    }
};

// Get user info for third-party dashboard
router.get('/user-info', thirdPartyAuth, async (req, res) => {
    try {
        const userInfo = {
            username: req.user.username,
            role: req.user.role,
            login_time: new Date().toISOString(),
            permissions: ['search_therapists', 'view_history', 'download_reports']
        };

        res.json({
            success: true,
            user: userInfo
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user information'
        });
    }
});

// Search therapists by name or NIC (for government officers)
router.get('/therapists/search', thirdPartyAuth, async (req, res) => {
    try {
        const { query, limit = 20 } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters long'
            });
        }

        // Search approved therapists only
        const [therapists] = await db.execute(`
            SELECT 
                t.id,
                t.name,
                t.email,
                t.phone,
                t.address,
                t.specializations,
                t.experience_years,
                t.status,
                t.approved_date,
                t.working_history,
                s.name as current_spa_name,
                s.reference_number as spa_reference,
                s.owner_fname,
                s.owner_lname,
                s.phone as spa_phone,
                s.address as spa_address
            FROM therapists t
            JOIN spas s ON t.spa_id = s.id
            WHERE t.status = 'approved' 
            AND (
                t.name LIKE ? 
                OR t.email LIKE ?
                OR s.name LIKE ?
                OR s.reference_number LIKE ?
            )
            ORDER BY t.name ASC
            LIMIT ?
        `, [
            `%${query}%`,
            `%${query}%`,
            `%${query}%`,
            `%${query}%`,
            parseInt(limit)
        ]);

        // Enrich therapist data
        const enrichedTherapists = therapists.map(therapist => ({
            ...therapist,
            specializations: JSON.parse(therapist.specializations || '[]'),
            working_history: JSON.parse(therapist.working_history || '[]'),
            spa_owner_full_name: `${therapist.owner_fname} ${therapist.owner_lname}`,
            verification_status: 'LSA Approved',
            last_verification_date: therapist.approved_date
        }));

        // Log search activity (for audit purposes)
        if (enrichedTherapists.length > 0) {
            await ActivityLogModel.logActivity({
                entity_type: 'therapist',
                entity_id: null, // Multiple therapists
                action: 'searched',
                description: `Government officer searched for "${query}" - ${enrichedTherapists.length} results found`,
                actor_type: 'lsa', // Government officers are under LSA authority
                actor_id: req.user.id,
                actor_name: req.user.username
            });
        }

        res.json({
            success: true,
            therapists: enrichedTherapists,
            total_results: enrichedTherapists.length,
            search_query: query,
            searched_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error searching therapists:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search therapists'
        });
    }
});

// Get detailed therapist profile with full working history
router.get('/therapists/:id', thirdPartyAuth, async (req, res) => {
    try {
        const therapistId = req.params.id;

        const [therapist] = await db.execute(`
            SELECT 
                t.*,
                s.name as current_spa_name,
                s.reference_number as spa_reference,
                s.owner_fname,
                s.owner_lname,
                s.phone as spa_phone,
                s.address as spa_address,
                s.email as spa_email
            FROM therapists t
            JOIN spas s ON t.spa_id = s.id
            WHERE t.id = ? AND t.status = 'approved'
        `, [therapistId]);

        if (therapist.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found or not approved'
            });
        }

        // Get full working history with spa names
        const workingHistory = JSON.parse(therapist[0].working_history || '[]');

        // Enrich working history with spa details
        const enrichedHistory = [];
        for (const entry of workingHistory) {
            if (entry.spa_id) {
                const [spaInfo] = await db.execute(
                    'SELECT name, reference_number FROM spas WHERE id = ?',
                    [entry.spa_id]
                );

                enrichedHistory.push({
                    ...entry,
                    spa_name: spaInfo[0]?.name || 'Unknown Spa',
                    spa_reference: spaInfo[0]?.reference_number || 'N/A'
                });
            } else {
                enrichedHistory.push(entry);
            }
        }

        // Get therapist activities/history
        const activities = await ActivityLogModel.getEntityActivities('therapist', therapistId);

        const therapistProfile = {
            ...therapist[0],
            specializations: JSON.parse(therapist[0].specializations || '[]'),
            working_history: enrichedHistory,
            spa_owner_full_name: `${therapist[0].owner_fname} ${therapist[0].owner_lname}`,
            verification_status: 'LSA Approved',
            total_spa_experience: enrichedHistory.length,
            activities: activities.slice(0, 10) // Last 10 activities
        };

        // Log profile access
        await ActivityLogModel.logActivity({
            entity_type: 'therapist',
            entity_id: therapistId,
            action: 'profile_accessed',
            description: `Government officer ${req.user.username} accessed profile of ${therapist[0].name}`,
            actor_type: 'lsa',
            actor_id: req.user.id,
            actor_name: req.user.username
        });

        res.json({
            success: true,
            therapist: therapistProfile,
            accessed_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching therapist profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch therapist profile'
        });
    }
});

// Get therapist working history for verification
router.get('/therapists/:id/history', thirdPartyAuth, async (req, res) => {
    try {
        const therapistId = req.params.id;

        const [therapist] = await db.execute(`
            SELECT t.name, t.working_history, t.total_experience_years
            FROM therapists t
            WHERE t.id = ? AND t.status = 'approved'
        `, [therapistId]);

        if (therapist.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found or not approved'
            });
        }

        const workingHistory = JSON.parse(therapist[0].working_history || '[]');

        // Enrich with spa details and calculate experience
        const detailedHistory = [];
        let totalExperience = 0;

        for (const entry of workingHistory) {
            if (entry.spa_id) {
                const [spa] = await db.execute(
                    'SELECT name, reference_number, address FROM spas WHERE id = ?',
                    [entry.spa_id]
                );

                // Calculate duration
                const startDate = new Date(entry.start_date);
                const endDate = entry.end_date ? new Date(entry.end_date) : new Date();
                const durationMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));

                totalExperience += durationMonths;

                detailedHistory.push({
                    spa_name: spa[0]?.name || 'Unknown Spa',
                    spa_reference: spa[0]?.reference_number || 'N/A',
                    spa_address: spa[0]?.address || 'N/A',
                    start_date: entry.start_date,
                    end_date: entry.end_date,
                    duration_months: durationMonths,
                    position: entry.position || 'Therapist',
                    status: entry.status || 'Completed',
                    is_current: !entry.end_date
                });
            }
        }

        res.json({
            success: true,
            therapist_name: therapist[0].name,
            working_history: detailedHistory,
            summary: {
                total_spas_worked: detailedHistory.length,
                total_experience_months: totalExperience,
                total_experience_years: Math.round(totalExperience / 12 * 10) / 10,
                current_employment: detailedHistory.find(h => h.is_current) || null
            }
        });
    } catch (error) {
        console.error('Error fetching therapist history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch therapist working history'
        });
    }
});

// Get statistics for third-party dashboard
router.get('/statistics', thirdPartyAuth, async (req, res) => {
    try {
        // Get overall system statistics
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM spas WHERE verification_status = 'approved') as verified_spas,
                (SELECT COUNT(*) FROM therapists WHERE status = 'approved') as approved_therapists,
                (SELECT COUNT(DISTINCT spa_id) FROM therapists WHERE status = 'approved') as spas_with_therapists,
                (SELECT COUNT(*) FROM spas WHERE status = 'pending') as pending_spas
        `);

        // Get specialization breakdown
        const [specializations] = await db.execute(`
            SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(specializations, '$[0]')) as specialty,
                COUNT(*) as count
            FROM therapists 
            WHERE status = 'approved' AND specializations IS NOT NULL
            GROUP BY JSON_UNQUOTE(JSON_EXTRACT(specializations, '$[0]'))
            ORDER BY count DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            statistics: {
                system_overview: stats[0],
                popular_specializations: specializations,
                last_updated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// Download verification report (placeholder for file generation)
router.get('/reports/verification/:therapistId', thirdPartyAuth, async (req, res) => {
    try {
        const therapistId = req.params.therapistId;

        // Get therapist data for report
        const [therapist] = await db.execute(`
            SELECT 
                t.*,
                s.name as spa_name,
                s.reference_number
            FROM therapists t
            JOIN spas s ON t.spa_id = s.id
            WHERE t.id = ? AND t.status = 'approved'
        `, [therapistId]);

        if (therapist.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found'
            });
        }

        // Log report generation
        await ActivityLogModel.logActivity({
            entity_type: 'therapist',
            entity_id: therapistId,
            action: 'report_generated',
            description: `Verification report generated for ${therapist[0].name} by ${req.user.username}`,
            actor_type: 'lsa',
            actor_id: req.user.id,
            actor_name: req.user.username
        });

        // Return report data (in real implementation, this would generate a PDF)
        res.json({
            success: true,
            report: {
                therapist_name: therapist[0].name,
                spa_name: therapist[0].spa_name,
                spa_reference: therapist[0].reference_number,
                verification_status: 'APPROVED',
                approved_date: therapist[0].approved_date,
                specializations: JSON.parse(therapist[0].specializations || '[]'),
                experience_years: therapist[0].experience_years,
                generated_by: req.user.username,
                generated_at: new Date().toISOString(),
                report_id: `RPT-${therapistId}-${Date.now()}`
            }
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate verification report'
        });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/public/spas
// Get spas by category (verified, unverified, blacklisted)
router.get('/spas', async (req, res) => {
    try {
        const {
            category = 'verified',
            page = 1,
            limit = 12,
            search = '',
            province = '',
            sortBy = 'name'
        } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];

        // Filter by category
        switch (category) {
            case 'verified':
                whereClause += ' AND s.status = "verified" AND s.annual_fee_paid = true AND s.blacklist_reason IS NULL';
                break;
            case 'unverified':
                whereClause += ' AND s.status = "verified" AND s.annual_fee_paid = false AND s.blacklist_reason IS NULL';
                break;
            case 'blacklisted':
                whereClause += ' AND s.blacklist_reason IS NOT NULL';
                break;
            case 'all':
                whereClause += ' AND s.status IN ("verified", "approved")';
                break;
            default:
                whereClause += ' AND s.status = "verified" AND s.annual_fee_paid = true AND s.blacklist_reason IS NULL';
        }

        // Search filter
        if (search) {
            whereClause += ' AND (s.name LIKE ? OR s.address_line1 LIKE ? OR s.province LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Province filter
        if (province) {
            whereClause += ' AND s.province = ?';
            params.push(province);
        }

        // Sorting
        let orderBy = 'ORDER BY s.name ASC';
        switch (sortBy) {
            case 'name':
                orderBy = 'ORDER BY s.name ASC';
                break;
            case 'newest':
                orderBy = 'ORDER BY s.created_at DESC';
                break;
            case 'province':
                orderBy = 'ORDER BY s.province ASC, s.name ASC';
                break;
            default:
                orderBy = 'ORDER BY s.name ASC';
        }

        const offset = (page - 1) * limit;

        // Get spas with basic info
        const [spas] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.reference_number,
        s.address_line1,
        s.address_line2,
        s.province,
        s.postal_code,
        s.spa_tel,
        s.spa_photos_banner_path,
        s.facility_photos,
        s.status,
        s.annual_fee_paid,
        s.blacklist_reason,
        s.created_at,
        CASE 
          WHEN s.blacklist_reason IS NOT NULL THEN 'blacklisted'
          WHEN s.status = 'verified' AND s.annual_fee_paid = true THEN 'verified'
          WHEN s.status = 'verified' AND s.annual_fee_paid = false THEN 'unverified'
          ELSE s.status
        END as display_category,
        (SELECT COUNT(*) FROM therapists t WHERE t.spa_id = s.id AND t.status = 'approved') as therapist_count
      FROM spas s
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

        // Process spa data
        const processedSpas = spas.map(spa => ({
            ...spa,
            facility_photos: spa.facility_photos ? JSON.parse(spa.facility_photos) : [],
            banner_image: spa.spa_photos_banner_path || (spa.facility_photos ? JSON.parse(spa.facility_photos)[0] : null)
        }));

        // Get total count for pagination
        const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM spas s
      ${whereClause}
    `, params);

        // Get category counts
        const [categoryCounts] = await db.execute(`
      SELECT 
        SUM(CASE WHEN s.status = 'verified' AND s.annual_fee_paid = true AND s.blacklist_reason IS NULL THEN 1 ELSE 0 END) as verified_count,
        SUM(CASE WHEN s.status = 'verified' AND s.annual_fee_paid = false AND s.blacklist_reason IS NULL THEN 1 ELSE 0 END) as unverified_count,
        SUM(CASE WHEN s.blacklist_reason IS NOT NULL THEN 1 ELSE 0 END) as blacklisted_count
      FROM spas s
    `);

        res.json({
            success: true,
            data: {
                spas: processedSpas,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                },
                categories: {
                    verified: categoryCounts[0].verified_count,
                    unverified: categoryCounts[0].unverified_count,
                    blacklisted: categoryCounts[0].blacklisted_count
                },
                currentCategory: category
            }
        });

    } catch (error) {
        console.error('Public spas fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch spas'
        });
    }
});

// GET /api/public/spa/:id
// Get detailed spa information for public view
router.get('/spa/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [spa] = await db.execute(`
      SELECT 
        s.*,
        CASE 
          WHEN s.blacklist_reason IS NOT NULL THEN 'blacklisted'
          WHEN s.status = 'verified' AND s.annual_fee_paid = true THEN 'verified'
          WHEN s.status = 'verified' AND s.annual_fee_paid = false THEN 'unverified'
          ELSE s.status
        END as display_category
      FROM spas s
      WHERE s.id = ? AND s.status IN ('verified', 'approved')
    `, [id]);

        if (spa.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Spa not found or not publicly available'
            });
        }

        const spaData = spa[0];

        // Get therapists for this spa
        const [therapists] = await db.execute(`
      SELECT 
        id, fname, lname, specialty, 
        therapist_image_path, telno
      FROM therapists 
      WHERE spa_id = ? AND status = 'approved'
    `, [id]);

        // Parse JSON fields
        spaData.facility_photos = spaData.facility_photos ? JSON.parse(spaData.facility_photos) : [];
        spaData.professional_certifications = spaData.professional_certifications ? JSON.parse(spaData.professional_certifications) : [];

        res.json({
            success: true,
            data: {
                spa: spaData,
                therapists: therapists.map(t => ({
                    ...t,
                    full_name: `${t.fname} ${t.lname}`
                }))
            }
        });

    } catch (error) {
        console.error('Public spa details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch spa details'
        });
    }
});

// GET /api/public/provinces
// Get list of provinces where spas are located
router.get('/provinces', async (req, res) => {
    try {
        const [provinces] = await db.execute(`
      SELECT DISTINCT province, COUNT(*) as spa_count
      FROM spas 
      WHERE status = 'verified' AND province IS NOT NULL AND province != ''
      GROUP BY province
      ORDER BY province ASC
    `);

        res.json({
            success: true,
            data: provinces
        });

    } catch (error) {
        console.error('Provinces fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch provinces'
        });
    }
});

// GET /api/public/stats
// Get public statistics
router.get('/stats', async (req, res) => {
    try {
        const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_spas,
        SUM(CASE WHEN status = 'verified' AND annual_fee_paid = true THEN 1 ELSE 0 END) as verified_spas,
        (SELECT COUNT(*) FROM therapists WHERE status = 'approved') as total_therapists,
        COUNT(DISTINCT province) as provinces_covered
      FROM spas
      WHERE status IN ('verified', 'approved')
    `);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Public stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// GET /api/public/featured-spas
// Get featured spas for homepage
router.get('/featured-spas', async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const [spas] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.address_line1,
        s.province,
        s.spa_photos_banner_path,
        s.facility_photos,
        (SELECT COUNT(*) FROM therapists t WHERE t.spa_id = s.id AND t.status = 'approved') as therapist_count
      FROM spas s
      WHERE s.status = 'verified' 
        AND s.annual_fee_paid = true 
        AND s.blacklist_reason IS NULL
      ORDER BY s.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

        const processedSpas = spas.map(spa => ({
            ...spa,
            facility_photos: spa.facility_photos ? JSON.parse(spa.facility_photos) : [],
            banner_image: spa.spa_photos_banner_path || (spa.facility_photos ? JSON.parse(spa.facility_photos)[0] : null)
        }));

        res.json({
            success: true,
            data: processedSpas
        });

    } catch (error) {
        console.error('Featured spas error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured spas'
        });
    }
});

// GET /api/public/search-suggestions
// Get search suggestions for autocomplete
router.get('/search-suggestions', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        const [suggestions] = await db.execute(`
      SELECT DISTINCT name as suggestion, 'spa' as type
      FROM spas 
      WHERE name LIKE ? 
        AND status = 'verified' 
        AND blacklist_reason IS NULL
      UNION
      SELECT DISTINCT province as suggestion, 'location' as type
      FROM spas 
      WHERE province LIKE ? 
        AND status = 'verified' 
        AND blacklist_reason IS NULL
      LIMIT 10
    `, [`%${query}%`, `%${query}%`]);

        res.json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch search suggestions'
        });
    }
});

module.exports = router;
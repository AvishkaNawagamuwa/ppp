const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Authentication middleware for AdminLSA
const authenticateAdminLSA = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const [user] = await db.execute(
            'SELECT * FROM admin_users WHERE id = ? AND role = "admin_lsa" AND is_active = true',
            [decoded.id]
        );

        if (user.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        req.user = user[0];
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Authentication middleware for Third-Party (Government Officers)
const authenticateThirdParty = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        // Check if token starts with 'demo-token' for frontend demo functionality
        if (token.startsWith('demo-token-')) {
            req.user = {
                id: 'demo',
                username: 'demo_officer',
                full_name: 'Demo Government Officer',
                role: 'government_officer'
            };
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const [user] = await db.execute(
            'SELECT * FROM third_party_users WHERE id = ? AND role = "government_officer" AND is_active = 1',
            [decoded.id]
        );

        if (user.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }

        req.user = user[0];
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Generate random password
const generatePassword = (length = 8) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// POST /api/third-party/create
// Create temporary government officer login
router.post('/create', authenticateAdminLSA, async (req, res) => {
    try {
        const { username, department, duration = 8 } = req.body; // duration in hours

        if (!username || !department) {
            return res.status(400).json({
                success: false,
                error: 'Username and department are required'
            });
        }

        // Check if username already exists
        const [existingUser] = await db.execute(
            'SELECT id FROM admin_users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }

        // Generate temporary password
        const tempPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Calculate expiration time
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + duration);

        // Create temporary user
        const [result] = await db.execute(`
      INSERT INTO admin_users (
        username, email, password_hash, role, is_temporary, expires_at, 
        created_by, full_name, department, is_active
      ) VALUES (?, ?, ?, 'government_officer', true, ?, ?, ?, ?, true)
    `, [
            username,
            `${username}@temp.gov.lk`,
            hashedPassword,
            expiresAt,
            req.user.id,
            `Officer ${username}`,
            department
        ]);

        // Log activity
        await db.execute(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, description, actor_type, actor_id, actor_name, created_at
      ) VALUES ('user', ?, 'created', ?, 'lsa', ?, ?, NOW())
    `, [
            result.insertId,
            `Created temporary government officer account: ${username}`,
            req.user.id,
            req.user.full_name
        ]);

        res.status(201).json({
            success: true,
            message: 'Temporary government officer account created successfully',
            data: {
                id: result.insertId,
                username,
                temporaryPassword: tempPassword,
                department,
                expiresAt,
                loginUrl: '/third-party-login'
            }
        });

    } catch (error) {
        console.error('Create third-party user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create temporary account'
        });
    }
});

// GET /api/third-party/accounts
// Get all third-party accounts
router.get('/accounts', authenticateAdminLSA, async (req, res) => {
    try {
        const [accounts] = await db.execute(`
      SELECT 
        id, username, full_name, department, is_active, 
        expires_at, created_at, last_login,
        CASE 
          WHEN expires_at < NOW() THEN 'expired'
          WHEN is_active = false THEN 'inactive'
          ELSE 'active'
        END as status
      FROM admin_users 
      WHERE role = 'government_officer'
      ORDER BY created_at DESC
    `);

        res.json({
            success: true,
            data: accounts
        });

    } catch (error) {
        console.error('Fetch accounts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch accounts'
        });
    }
});

// DELETE /api/third-party/account/:id
// Delete third-party account
router.delete('/account/:id', authenticateAdminLSA, async (req, res) => {
    try {
        const { id } = req.params;

        // Get account details before deletion
        const [account] = await db.execute(
            'SELECT username FROM admin_users WHERE id = ? AND role = "government_officer"',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        // Delete the account
        await db.execute('DELETE FROM admin_users WHERE id = ?', [id]);

        // Log activity
        await db.execute(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, description, actor_type, actor_id, actor_name, created_at
      ) VALUES ('user', ?, 'deleted', ?, 'lsa', ?, ?, NOW())
    `, [
            id,
            `Deleted government officer account: ${account[0].username}`,
            req.user.id,
            req.user.full_name
        ]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
});

// POST /api/third-party/login
// Login for government officers using third_party_users table
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Find user in third_party_users table
        const [user] = await db.execute(
            'SELECT * FROM third_party_users WHERE username = ? AND role = "government_officer" AND is_active = 1',
            [username]
        );

        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const userData = user[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, userData.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await db.execute(
            'UPDATE third_party_users SET last_login = NOW() WHERE id = ?',
            [userData.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: userData.id, username: userData.username, role: userData.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: userData.id,
                username: userData.username,
                fullName: userData.full_name || 'Government Officer',
                role: userData.role,
                lastLogin: userData.last_login
            }
        });

    } catch (error) {
        console.error('Third-party login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// GET /api/third-party/therapists/search
// Enhanced search for all therapists with comprehensive data
router.get('/therapists/search', authenticateThirdParty, async (req, res) => {
    try {
        console.log('🔍 Third-party therapists search request:', req.query);
        const { query = '', page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;
        console.log('📊 Pagination:', { page, limit, offset });

        let searchCondition = '';
        let searchParams = [];

        if (query.trim()) {
            searchCondition = `WHERE (t.nic LIKE ? OR CONCAT(t.first_name, ' ', t.last_name) LIKE ? OR t.first_name LIKE ? OR t.last_name LIKE ?)`;
            searchParams = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
        } else {
            searchCondition = `WHERE (t.status IN ('approved', 'pending', 'rejected', 'resigned', 'terminated') OR t.status IS NULL)`;
        }

        // Search all therapists with comprehensive data (using actual database column names)
        const [therapists] = await db.execute(`
            SELECT 
                t.id,
                t.spa_id,
                t.first_name,
                t.last_name,
                t.nic,
                t.phone,
                t.email,
                t.specializations,
                t.date_of_birth,
                t.status,
                t.nic_attachment,
                t.medical_certificate,
                t.spa_center_certificate,
                t.therapist_image,
                t.created_at,
                t.approved_date,
                t.approved_by,
                t.resign_date,
                t.resignation_reason,
                t.termination_reason,
                s.name as spa_name
            FROM therapists t
            LEFT JOIN spas s ON t.spa_id = s.id
            ${searchCondition}
            ORDER BY t.created_at DESC
        `, searchParams);

        console.log('✅ Therapists query successful, found:', therapists.length, 'therapists');

        // Process and format data using actual database columns
        const processedTherapists = therapists.map(therapist => {
            // Handle specializations (JSON field)
            let specialty = 'General Therapy';
            if (therapist.specializations) {
                try {
                    const specs = JSON.parse(therapist.specializations);
                    if (Array.isArray(specs) && specs.length > 0) {
                        specialty = specs.join(', ');
                    }
                } catch (e) {
                    // Keep default specialty
                }
            }

            return {
                id: therapist.id,
                name: `${therapist.first_name || ''} ${therapist.last_name || ''}`.trim() || 'Unknown Therapist',
                nic: therapist.nic,
                phone: therapist.phone,
                email: therapist.email,
                specialty: specialty,
                birthday: therapist.date_of_birth,
                status: therapist.status || 'pending',
                spa_name: therapist.spa_name,
                registration_date: therapist.created_at,
                reviewed_at: therapist.approved_date,
                reviewed_by: therapist.approved_by,
                resigned_at: therapist.resign_date,
                terminated_at: null,
                rejection_reason: therapist.rejection_reason,
                termination_reason: therapist.termination_reason,
                documents: {
                    nic_attachment: therapist.nic_attachment,
                    medical_certificate: therapist.medical_certificate,
                    spa_center_certificate: therapist.spa_center_certificate,
                    therapist_image: therapist.therapist_image
                }
            };
        });

        // Get total count
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM therapists t
            LEFT JOIN spas s ON t.spa_id = s.id
            ${searchCondition}
        `, searchParams);

        // Activity logging temporarily disabled due to column size issue
        console.log('📋 Search completed for query:', query, '- Found:', processedTherapists.length, 'results');

        res.json({
            success: true,
            data: {
                therapists: processedTherapists,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Therapist search error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sql: error.sql
        });
        res.status(500).json({
            success: false,
            error: 'Failed to search therapists'
        });
    }
});

// GET /api/third-party/therapist-history (Keep for backward compatibility)
// Search and view therapist working history
router.get('/therapist-history', authenticateThirdParty, async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        if (!search) {
            return res.status(400).json({
                success: false,
                error: 'Search term is required'
            });
        }

        const offset = (page - 1) * limit;

        // Search therapists by NIC or name
        const [therapists] = await db.execute(`
      SELECT 
        t.*,
        s.name as current_spa_name,
        s.reference_number as spa_reference,
        s.owner_fname as spa_owner_fname,
        s.owner_lname as spa_owner_lname
      FROM therapists t
      LEFT JOIN spas s ON t.spa_id = s.id
      WHERE (t.nic LIKE ? OR t.fname LIKE ? OR t.lname LIKE ?)
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            parseInt(limit),
            parseInt(offset)
        ]);

        // Process working history
        const processedTherapists = therapists.map(therapist => ({
            ...therapist,
            working_history: therapist.working_history ? JSON.parse(therapist.working_history) : [],
            full_name: `${therapist.fname} ${therapist.lname}`
        }));

        // Get total count
        const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM therapists t
      WHERE (t.nic LIKE ? OR t.fname LIKE ? OR t.lname LIKE ?)
    `, [`%${search}%`, `%${search}%`, `%${search}%`]);

        // Activity logging temporarily disabled due to column size issue
        console.log('🔍 Therapist history search completed for:', search);

        res.json({
            success: true,
            data: {
                therapists: processedTherapists,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Therapist history search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search therapist history'
        });
    }
});

// GET /api/third-party/therapist/:id
// Get detailed therapist information by ID with comprehensive history and documents
router.get('/therapist/:id', authenticateThirdParty, async (req, res) => {
    try {
        const { id } = req.params;

        // Get comprehensive therapist details with spa information using correct column names
        const [therapist] = await db.execute(`
            SELECT 
                t.*,
                s.name as current_spa_name,
                s.reference_number,
                s.owner_fname,
                s.owner_lname,
                s.email as spa_email,
                s.phone as spa_phone,
                s.address
            FROM therapists t
            LEFT JOIN spas s ON t.spa_id = s.id
            WHERE t.id = ?
        `, [id]);

        if (therapist.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found'
            });
        }

        const therapistData = therapist[0];

        // Parse and enhance working history with spa details
        let workingHistory = [];
        if (therapistData.working_history) {
            try {
                // Check if working_history is already an object or needs parsing
                let historyData = therapistData.working_history;
                if (typeof historyData === 'string') {
                    historyData = JSON.parse(historyData);
                } else if (Array.isArray(historyData)) {
                    // Already an array, use as is
                } else {
                    // If it's an object but not an array, wrap it
                    historyData = [historyData];
                }

                // Enhance each history entry with spa details
                for (const entry of historyData) {
                    const [spa] = await db.execute(`
                        SELECT name, spa_br_number as business_reg_number, owner_fname, owner_lname
                        FROM spas WHERE id = ?
                    `, [entry.spa_id]);

                    // Calculate duration
                    let duration = 'Ongoing';
                    if (entry.start_date && entry.end_date) {
                        const start = new Date(entry.start_date);
                        const end = new Date(entry.end_date);
                        const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
                        duration = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : 'Less than a month';
                    } else if (entry.start_date && !entry.end_date) {
                        const start = new Date(entry.start_date);
                        const now = new Date();
                        const months = Math.round((now - start) / (1000 * 60 * 60 * 24 * 30));
                        duration = months > 0 ? `${months} month${months > 1 ? 's' : ''} (Current)` : 'Less than a month (Current)';
                    }

                    workingHistory.push({
                        ...entry,
                        spa_details: spa[0] || null,
                        duration: duration,
                        role: entry.role || 'Therapist'
                    });
                }
            } catch (e) {
                console.warn('Error parsing working history:', e);
                workingHistory = [];
            }
        }

        // Format comprehensive therapist data using actual column names
        const formattedTherapist = {
            id: therapistData.id,
            personal_info: {
                full_name: `${therapistData.first_name || ''} ${therapistData.last_name || ''}`.trim(),
                first_name: therapistData.first_name,
                last_name: therapistData.last_name,
                nic: therapistData.nic,
                email: therapistData.email,
                phone: therapistData.phone,
                birthday: therapistData.date_of_birth,
                specialty: therapistData.specializations,
                registration_date: therapistData.created_at,
                status: therapistData.status
            },
            current_employment: {
                spa_name: therapistData.current_spa_name,
                spa_br_number: therapistData.reference_number,
                spa_owner: `${therapistData.owner_fname || ''} ${therapistData.owner_lname || ''}`.trim(),
                spa_owner_email: therapistData.spa_email,
                spa_owner_phone: therapistData.spa_phone,
                spa_address: therapistData.address,
                spa_province: 'Not specified',
                spa_postal_code: 'Not specified'
            },
            documents: {
                nic_attachment: therapistData.nic_attachment,
                medical_certificate: therapistData.medical_certificate,
                spa_center_certificate: therapistData.spa_center_certificate,
                therapist_image: therapistData.therapist_image
            },
            working_history: workingHistory.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)),
            review_info: {
                reviewed_at: therapistData.reviewed_at,
                reviewed_by: therapistData.reviewed_by,
                rejection_reason: therapistData.rejection_reason,
                resigned_at: therapistData.resigned_at,
                terminated_at: therapistData.terminated_at,
                termination_reason: therapistData.termination_reason
            }
        };

        // Activity logging temporarily disabled due to column size issue
        console.log('👁️ Therapist details viewed:', therapistData.name || therapistData.first_name, '(ID:', therapistData.id, ')');

        res.json({
            success: true,
            data: formattedTherapist
        });

    } catch (error) {
        console.error('Get therapist details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch therapist details'
        });
    }
});

// GET /api/third-party/therapist/:nic/detailed-history (Keep for backward compatibility)
// Get detailed working history for a specific therapist
router.get('/therapist/:nic/detailed-history', authenticateThirdParty, async (req, res) => {
    try {
        const { nic } = req.params;

        // Get therapist details
        const [therapist] = await db.execute(`
      SELECT 
        t.*,
        s.name as current_spa_name,
        s.reference_number as spa_reference,
        s.address_line1,
        s.province
      FROM therapists t
      LEFT JOIN spas s ON t.spa_id = s.id
      WHERE t.nic = ?
    `, [nic]);

        if (therapist.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found'
            });
        }

        const therapistData = therapist[0];

        // Get working history with spa details
        let workingHistory = [];
        if (therapistData.working_history) {
            const historyData = JSON.parse(therapistData.working_history);

            // Fetch spa details for each history entry
            for (const entry of historyData) {
                const [spa] = await db.execute(
                    'SELECT name, reference_number FROM spas WHERE id = ?',
                    [entry.spa_id]
                );

                workingHistory.push({
                    ...entry,
                    spa_details: spa[0] || null
                });
            }
        }

        // Activity logging temporarily disabled due to column size issue
        console.log('📋 Therapist detailed history viewed:', therapistData.fname, therapistData.lname, '(NIC:', nic, ')');

        res.json({
            success: true,
            data: {
                therapist: {
                    ...therapistData,
                    full_name: `${therapistData.fname} ${therapistData.lname}`,
                    working_history: workingHistory
                }
            }
        });

    } catch (error) {
        console.error('Detailed history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch detailed history'
        });
    }
});

// GET /api/third-party/user-info
// Get current user information
router.get('/user-info', authenticateThirdParty, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                id: req.user.id,
                username: req.user.username,
                full_name: req.user.full_name,
                department: req.user.department,
                expires_at: req.user.expires_at,
                created_at: req.user.created_at,
                last_login: req.user.last_login
            }
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user information'
        });
    }
});

// GET /api/third-party/dashboard/stats
// Dashboard statistics for government officers
router.get('/dashboard/stats', authenticateThirdParty, async (req, res) => {
    try {
        const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM therapists WHERE status = 'approved') as total_approved_therapists,
        (SELECT COUNT(*) FROM therapists WHERE status = 'pending') as pending_therapists,
        (SELECT COUNT(*) FROM spas WHERE status = 'verified') as verified_spas,
        (SELECT COUNT(*) FROM spas WHERE blacklist_reason IS NOT NULL) as blacklisted_spas
    `);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Third-party dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});

module.exports = router;
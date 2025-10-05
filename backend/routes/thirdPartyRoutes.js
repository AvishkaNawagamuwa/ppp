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

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const [user] = await db.execute(
            'SELECT * FROM admin_users WHERE id = ? AND role = "government_officer" AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())',
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
// Login for government officers
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Find user
        const [user] = await db.execute(
            'SELECT * FROM admin_users WHERE username = ? AND role = "government_officer" AND is_active = true',
            [username]
        );

        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const userData = user[0];

        // Check if account is expired
        if (userData.expires_at && new Date(userData.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                error: 'Account has expired'
            });
        }

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
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
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
            data: {
                token,
                user: {
                    id: userData.id,
                    username: userData.username,
                    fullName: userData.full_name,
                    department: userData.department,
                    role: userData.role,
                    expiresAt: userData.expires_at
                }
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

// GET /api/third-party/therapist-history
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

        // Log search activity
        await db.execute(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, description, actor_type, actor_id, actor_name, created_at
      ) VALUES ('therapist', 0, 'search', ?, 'government_officer', ?, ?, NOW())
    `, [
            `Searched therapist history for: ${search}`,
            req.user.id,
            req.user.full_name
        ]);

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

// GET /api/third-party/therapist/:nic/detailed-history
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
                    'SELECT name, reference_number, address_line1, province FROM spas WHERE id = ?',
                    [entry.spa_id]
                );

                workingHistory.push({
                    ...entry,
                    spa_details: spa[0] || null
                });
            }
        }

        // Log access
        await db.execute(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, description, actor_type, actor_id, actor_name, created_at
      ) VALUES ('therapist', ?, 'view_history', ?, 'government_officer', ?, ?, NOW())
    `, [
            therapistData.id,
            `Viewed detailed history for therapist: ${therapistData.fname} ${therapistData.lname} (${nic})`,
            req.user.id,
            req.user.full_name
        ]);

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
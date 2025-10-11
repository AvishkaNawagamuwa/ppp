const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345678',
    database: process.env.DB_NAME || 'lsa_spa_management',
    port: process.env.DB_PORT || 3306
};

async function createDefaultAdminUsers() {
    try {
        const connection = await mysql.createConnection(config);

        // Default users with plain text passwords (for easy testing)
        const defaultUsers = [
            {
                username: 'admin_lsa',
                email: 'admin_lsa@lsa.gov.lk',
                password: 'lsa123',  // Plain text password for easy testing
                role: 'admin_lsa',
                full_name: 'LSA Administrator',
                phone: '+94771234567'
            },
            {
                username: 'admin_spa',
                email: 'spa@test.com',
                password: 'spa123',  // Plain text password for easy testing
                role: 'admin_spa',
                full_name: 'Spa Administrator',
                phone: '+94771234568',
                spa_id: 1
            },
            {
                username: 'gov_officer',
                email: 'officer@gov.lk',
                password: 'gov123',  // Plain text password for easy testing
                role: 'government_officer',
                full_name: 'Government Officer',
                phone: '+94771234569',
                department: 'Health Department'
            }
        ];

        for (const user of defaultUsers) {
            // Check if user already exists by username OR email
            const [existing] = await connection.execute(
                'SELECT id, username, email FROM admin_users WHERE username = ? OR email = ?',
                [user.username, user.email]
            );

            if (existing.length === 0) {
                // For development, we'll store plain text passwords
                // In production, you should hash them with bcrypt
                await connection.execute(
                    `INSERT INTO admin_users (username, email, password_hash, role, full_name, phone, spa_id, department, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                    [
                        user.username,
                        user.email,
                        user.password, // Plain text for easy testing
                        user.role,
                        user.full_name,
                        user.phone,
                        user.spa_id || null,
                        user.department || null
                    ]
                );
                console.log(`✅ Created default user: ${user.username} (password: ${user.password})`);
            } else {
                // Update existing user with correct password for testing
                await connection.execute(
                    'UPDATE admin_users SET password_hash = ?, is_active = 1 WHERE username = ?',
                    [user.password, user.username]
                );
                console.log(`ℹ️  Updated existing user: ${user.username} (password: ${user.password})`);
            }
        }

        console.log('\n🎉 Default admin users setup completed!');
        console.log('\n📝 Login credentials for testing:');
        console.log('1. LSA Admin: username="admin_lsa", password="lsa123"');
        console.log('2. SPA Admin: username="admin_spa", password="spa123"');
        console.log('3. Government Officer: username="gov_officer", password="gov123"');

        await connection.end();

    } catch (error) {
        console.error('❌ Error creating default admin users:', error);
    }
}

createDefaultAdminUsers();
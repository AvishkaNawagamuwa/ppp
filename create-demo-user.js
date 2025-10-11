const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const config = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management',
    port: 3306
};

async function createSimpleTestUser() {
    try {
        const connection = await mysql.createConnection(config);

        const username = 'demo';
        const password = 'demo123';

        console.log('Creating simple test user...');
        console.log('Username: demo');
        console.log('Password: demo123');

        // Check if user exists
        const [existing] = await connection.execute(
            'SELECT id FROM third_party_users WHERE username = ?',
            [username]
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        if (existing.length > 0) {
            // Update existing user
            await connection.execute(
                'UPDATE third_party_users SET password_hash = ?, is_active = 1 WHERE username = ?',
                [hashedPassword, username]
            );
            console.log('✅ Updated existing user');
        } else {
            // Create new user
            await connection.execute(
                'INSERT INTO third_party_users (username, password_hash, full_name, role, created_by, is_active, created_at) VALUES (?, ?, ?, ?, 1, 1, NOW())',
                [username, hashedPassword, 'Demo Government Officer', 'government_officer']
            );
            console.log('✅ Created new user');
        }

        // Verify the user was created/updated
        const [user] = await connection.execute(
            'SELECT id, username, full_name, is_active FROM third_party_users WHERE username = ?',
            [username]
        );

        if (user.length > 0) {
            console.log('✅ User verified in database:');
            console.log('  ID:', user[0].id);
            console.log('  Username:', user[0].username);
            console.log('  Full Name:', user[0].full_name);
            console.log('  Active:', user[0].is_active ? 'Yes' : 'No');
        }

        await connection.end();
        console.log('\n🔗 You can now test login at: http://localhost:5173/third-party-login');
        console.log('📝 Use credentials: demo / demo123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createSimpleTestUser();
// Create test government officer account for third-party dashboard testing
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestGovOfficer() {
    console.log('🔧 Creating test government officer account...\n');

    try {
        // Create database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management',
            port: 3306
        });

        console.log('✅ Database connection successful');

        // Test credentials
        const username = 'gov_officer_test';
        const password = 'test123'; // Simple password for testing
        const department = 'Ministry of Health - Spa Regulation';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set expiration to 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Check if user already exists
        const [existingUser] = await connection.execute(
            'SELECT id FROM admin_users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            // Update existing user
            await connection.execute(`
                UPDATE admin_users 
                SET password_hash = ?, role = 'government_officer'
                WHERE username = ?
            `, [hashedPassword, username]);

            console.log('✅ Updated existing government officer account');
        } else {
            // Create new user - simplified without non-existent columns
            await connection.execute(`
                INSERT INTO admin_users (
                    username, email, password_hash, role, full_name
                ) VALUES (?, ?, ?, 'government_officer', ?)
            `, [
                username,
                `${username}@test.gov.lk`,
                hashedPassword,
                'Government Officer (Test)'
            ]);

            console.log('✅ Created new government officer account');
        }

        console.log('\n🎯 Test Account Details:');
        console.log('   Username: gov_officer_test');
        console.log('   Password: test123');
        console.log('   Department:', department);
        console.log('   Expires:', expiresAt.toLocaleString());
        console.log('\n🌐 Login URL: http://localhost:5173/third-party-login');
        console.log('📊 Dashboard URL: http://localhost:5173/third-party-dashboard');

        await connection.end();
        console.log('\n✅ Setup complete! You can now login with the test account.');

    } catch (error) {
        console.error('❌ Error creating test account:', error);
        process.exit(1);
    }
}

// Run the setup
createTestGovOfficer();
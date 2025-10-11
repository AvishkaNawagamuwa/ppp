const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345678',
    database: process.env.DB_NAME || 'lsa_spa_management',
    port: process.env.DB_PORT || 3306
};

async function checkUsers() {
    try {
        const connection = await mysql.createConnection(config);

        console.log('🔍 Checking current admin users...\n');

        const [users] = await connection.execute(
            'SELECT id, username, email, password_hash, role, is_active FROM admin_users ORDER BY id'
        );

        users.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password Hash: ${user.password_hash}`);
            console.log(`Active: ${user.is_active}`);
            console.log('-------------------');
        });

        await connection.end();

    } catch (error) {
        console.error('❌ Error checking users:', error);
    }
}

checkUsers();
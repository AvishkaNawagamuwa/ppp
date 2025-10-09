const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkAdminUsersTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check admin_users table structure
        console.log('\n=== ADMIN_USERS TABLE COLUMNS ===');
        try {
            const [columns] = await connection.execute('DESCRIBE admin_users');
            columns.forEach(col => {
                console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
            });
        } catch (error) {
            console.log('❌ admin_users table does not exist:', error.message);
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

checkAdminUsersTable();
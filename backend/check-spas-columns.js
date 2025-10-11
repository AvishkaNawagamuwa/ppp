const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkSpasTable() {
    let connection;

    try {
        console.log('🔗 Connecting to MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Get spas table columns
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'spas'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('\n📋 Spas table columns:');
        columns.forEach(col => {
            console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });

        // Check for email-related columns
        const emailColumns = columns.filter(col =>
            col.COLUMN_NAME.toLowerCase().includes('email')
        );

        console.log('\n📧 Email-related columns in spas table:');
        if (emailColumns.length > 0) {
            emailColumns.forEach(col => {
                console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
            });
        } else {
            console.log('- No email columns found');
        }

    } catch (error) {
        console.error('❌ Database Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

checkSpasTable();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkNotificationsTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check system_notifications table structure
        console.log('\n=== SYSTEM_NOTIFICATIONS TABLE COLUMNS ===');
        try {
            const [columns] = await connection.execute('DESCRIBE system_notifications');
            columns.forEach(col => {
                console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
            });
        } catch (error) {
            console.log('❌ system_notifications table does not exist:', error.message);
        }

        // Check activity_logs table structure if it exists
        console.log('\n=== ACTIVITY_LOGS TABLE COLUMNS ===');
        try {
            const [columns] = await connection.execute('DESCRIBE activity_logs');
            columns.forEach(col => {
                console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
            });
        } catch (error) {
            console.log('❌ activity_logs table does not exist:', error.message);
        }

        // Check what tables exist related to notifications
        console.log('\n=== TABLES RELATED TO NOTIFICATIONS ===');
        const [tables] = await connection.execute("SHOW TABLES LIKE '%notification%'");
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

        await connection.end();

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

checkNotificationsTable();
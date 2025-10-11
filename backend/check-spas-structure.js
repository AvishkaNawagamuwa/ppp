// Check spas table structure
const mysql = require('mysql2/promise');

const checkSpasTable = async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'lsa_spa_management'
        });

        console.log('🔍 Checking spas table structure...');
        const [columns] = await db.execute('DESCRIBE spas');
        console.log('📋 Spas table columns:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type}`);
        });

        await db.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

checkSpasTable();
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTableStructure() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management',
            port: 3306
        });

        console.log('📋 Therapist Table Structure:');
        const [columns] = await connection.execute('DESCRIBE therapists');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

        console.log('\n📄 Sample therapist data:');
        const [sample] = await connection.execute('SELECT * FROM therapists LIMIT 1');
        if (sample.length > 0) {
            console.log('Available columns:', Object.keys(sample[0]));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTableStructure();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTableStructure() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: 'lsa_spa_management'
        });

        console.log('✅ Connected to database');

        // Check therapists table structure
        const [rows] = await connection.execute('DESCRIBE therapists');
        console.log('\n📋 Therapists table structure:');
        console.table(rows);

        // Check current therapists data
        const [therapists] = await connection.execute('SELECT * FROM therapists LIMIT 5');
        console.log('\n📊 Current therapists data:');
        console.table(therapists);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkTableStructure();
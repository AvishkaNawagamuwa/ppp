const mysql = require('mysql2/promise');
require('dotenv').config();

async function patchDatabase() {
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

        // Add missing columns to spas table
        try {
            await connection.execute('ALTER TABLE spas ADD COLUMN owner_fname VARCHAR(100) AFTER name');
            console.log('✅ Added owner_fname column');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('⚠️ owner_fname column might already exist');
            }
        }

        try {
            await connection.execute('ALTER TABLE spas ADD COLUMN owner_lname VARCHAR(100) AFTER owner_fname');
            console.log('✅ Added owner_lname column');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('⚠️ owner_lname column might already exist');
            }
        }

        // Update existing spa with sample owner names
        await connection.execute('UPDATE spas SET owner_fname = ?, owner_lname = ? WHERE id = 1', ['John', 'Silva']);
        console.log('✅ Updated sample spa with owner name');

        console.log('🎉 Database patch completed successfully!');

    } catch (error) {
        console.error('❌ Database patch failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

patchDatabase();
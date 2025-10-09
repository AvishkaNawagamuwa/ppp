/**
 * Debug Script - Check therapists table structure and data
 */

const mysql = require('mysql2/promise');

async function debugTherapistsTable() {
    console.log('🔍 Debugging therapists table structure and data...\n');

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management',
            port: 3306
        });

        console.log('✅ Database connection successful\n');

        // Check table structure
        console.log('📋 Table Structure:');
        const [columns] = await connection.execute('DESCRIBE therapists');
        columns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Check approved therapists
        console.log('\n📊 Approved Therapists:');
        const [approvedTherapists] = await connection.execute(`
            SELECT id, therapist_id, first_name, last_name, email, status, spa_id 
            FROM therapists 
            WHERE status = 'approved' AND spa_id = 1
            LIMIT 5
        `);

        approvedTherapists.forEach(therapist => {
            console.log(`   ID: ${therapist.id || therapist.therapist_id} | Name: ${therapist.first_name} ${therapist.last_name} | Email: ${therapist.email} | Status: ${therapist.status}`);
        });

        // Check what the primary key field is called
        console.log('\n🔑 Primary Key Info:');
        const [keyInfo] = await connection.execute(`
            SHOW KEYS FROM therapists WHERE Key_name = 'PRIMARY'
        `);

        if (keyInfo.length > 0) {
            console.log(`   Primary key field: ${keyInfo[0].Column_name}`);
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugTherapistsTable();
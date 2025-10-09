/**
 * Check Database Connection and Therapist Data
 * Verify if there's therapist data in the database
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    console.log('🔍 Checking database connection and therapist data...\n');
    
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

        // Check if therapists table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'therapists'");
        if (tables.length === 0) {
            console.log('❌ Therapists table does not exist');
            return;
        }
        console.log('✅ Therapists table exists');

        // Check therapist count
        const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM therapists');
        const totalCount = countResult[0].count;
        console.log(`📊 Total therapists in database: ${totalCount}`);

        if (totalCount === 0) {
            console.log('⚠️  No therapist data found in database');
            console.log('\n💡 Would you like to add some sample therapist data?');
            return;
        }

        // Check therapists by status
        const [statusCounts] = await connection.execute(`
            SELECT status, COUNT(*) as count 
            FROM therapists 
            GROUP BY status
        `);

        console.log('\n📋 Therapists by status:');
        statusCounts.forEach(row => {
            console.log(`   ${row.status}: ${row.count}`);
        });

        // Show sample therapist data
        const [sampleData] = await connection.execute(`
            SELECT therapist_id, first_name, last_name, email, status, spa_id, specializations
            FROM therapists 
            LIMIT 3
        `);

        console.log('\n📝 Sample therapist data:');
        sampleData.forEach(therapist => {
            console.log(`   ID: ${therapist.therapist_id} | ${therapist.first_name} ${therapist.last_name} | ${therapist.email} | Status: ${therapist.status} | SPA ID: ${therapist.spa_id}`);
        });

        // Check spa_id = 1 specifically
        const [spaOneData] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM therapists 
            WHERE spa_id = 1
        `);
        
        console.log(`\n🏢 Therapists for SPA ID 1: ${spaOneData[0].count}`);

        await connection.end();
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    }
}

checkDatabase();
/**
 * Database Migration: Add resign and terminate reason columns to therapists table
 */

const mysql = require('mysql2/promise');

async function addReasonColumns() {
    console.log('🔧 Adding resign and terminate reason columns to therapists table...\n');

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

        // Check if columns exist
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM therapists LIKE 'resign_reason'
        `);

        const [terminateColumns] = await connection.execute(`
            SHOW COLUMNS FROM therapists LIKE 'terminate_reason'
        `);

        // Add resign_reason column if it doesn't exist
        if (columns.length === 0) {
            console.log('➕ Adding resign_reason column...');
            await connection.execute(`
                ALTER TABLE therapists 
                ADD COLUMN resign_reason TEXT NULL COMMENT 'Reason for resignation'
            `);
            console.log('✅ resign_reason column added successfully');
        } else {
            console.log('ℹ️  resign_reason column already exists');
        }

        // Add terminate_reason column if it doesn't exist
        if (terminateColumns.length === 0) {
            console.log('➕ Adding terminate_reason column...');
            await connection.execute(`
                ALTER TABLE therapists 
                ADD COLUMN terminate_reason TEXT NULL COMMENT 'Reason for termination'
            `);
            console.log('✅ terminate_reason column added successfully');
        } else {
            console.log('ℹ️  terminate_reason column already exists');
        }

        // Verify the columns
        const [finalColumns] = await connection.execute(`
            SHOW COLUMNS FROM therapists WHERE Field IN ('resign_reason', 'terminate_reason')
        `);

        console.log('\n📋 Reason columns in therapists table:');
        finalColumns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        await connection.end();
        console.log('\n🎉 Database migration completed successfully!');

    } catch (error) {
        console.error('❌ Database migration failed:', error.message);
    }
}

addReasonColumns();
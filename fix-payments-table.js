const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkAndFixPaymentsTable() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check current table structure
        const [columns] = await connection.execute("DESCRIBE payments");
        console.log('Current payments table structure:');
        console.table(columns);

        // Check if status column exists
        const hasStatus = columns.some(col => col.Field === 'status');

        if (!hasStatus) {
            console.log('Adding missing status column...');
            await connection.execute(`
                ALTER TABLE payments 
                ADD COLUMN status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending'
                AFTER amount
            `);
            console.log('✅ Status column added');
        }

        // Check other missing columns and add them if needed
        const missingColumns = [
            { name: 'bank_slip_path', sql: 'ADD COLUMN bank_slip_path VARCHAR(500) NULL AFTER reference_number' },
            { name: 'bank_transfer_approved', sql: 'ADD COLUMN bank_transfer_approved BOOLEAN DEFAULT FALSE AFTER bank_slip_path' },
            { name: 'approval_date', sql: 'ADD COLUMN approval_date TIMESTAMP NULL AFTER bank_transfer_approved' },
            { name: 'approved_by', sql: 'ADD COLUMN approved_by VARCHAR(100) NULL AFTER approval_date' },
            { name: 'rejection_reason', sql: 'ADD COLUMN rejection_reason TEXT NULL AFTER approved_by' },
            { name: 'payhere_order_id', sql: 'ADD COLUMN payhere_order_id VARCHAR(100) NULL AFTER rejection_reason' },
            { name: 'payhere_payment_id', sql: 'ADD COLUMN payhere_payment_id VARCHAR(100) NULL AFTER payhere_order_id' }
        ];

        for (const col of missingColumns) {
            const hasColumn = columns.some(c => c.Field === col.name);
            if (!hasColumn) {
                console.log(`Adding ${col.name} column...`);
                await connection.execute(`ALTER TABLE payments ${col.sql}`);
                console.log(`✅ ${col.name} column added`);
            }
        }

        console.log('\n📋 Final table structure:');
        const [finalColumns] = await connection.execute("DESCRIBE payments");
        console.table(finalColumns);

        console.log('\n✅ Payments table updated successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the function
checkAndFixPaymentsTable();
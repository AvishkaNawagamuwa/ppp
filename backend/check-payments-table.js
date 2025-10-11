require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkPaymentsTable() {
    let connection;

    try {
        console.log('🔗 Connecting to MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL Connected to LSA Spa Management Database');

        // Check if payments table exists
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payments'
        `, [dbConfig.database]);

        if (tables.length === 0) {
            console.log('❌ Payments table does not exist!');
            return;
        }

        console.log('✅ Payments table exists');

        // Get table structure
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payments'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('\nPayments table structure:');
        columns.forEach(col => {
            console.log(`${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.IS_NULLABLE}) DEFAULT=${col.COLUMN_DEFAULT}`);
        });

        // Check for sample data
        const [payments] = await connection.execute('SELECT COUNT(*) as count FROM payments');
        console.log(`\n📊 Total payments in database: ${payments[0].count}`);

        if (payments[0].count > 0) {
            // Show sample records
            const [samples] = await connection.execute(`
                SELECT 
                    id, 
                    spa_id, 
                    payment_type, 
                    amount, 
                    payment_method,
                    payment_status,
                    bank_slip_path,
                    created_at 
                FROM payments 
                LIMIT 5
            `);

            console.log('\n🔍 Sample payment records:');
            samples.forEach((payment, index) => {
                console.log(`\n${index + 1}. Payment ID: ${payment.id}`);
                console.log(`   SPA ID: ${payment.spa_id}`);
                console.log(`   Type: ${payment.payment_type}, Amount: LKR ${payment.amount}`);
                console.log(`   Method: ${payment.payment_method}, Status: ${payment.payment_status}`);
                console.log(`   Bank Slip: ${payment.bank_slip_path || 'None'}`);
                console.log(`   Created: ${payment.created_at}`);
            });
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

checkPaymentsTable();
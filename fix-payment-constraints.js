const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function fixPaymentTableConstraints() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Extend reference_number column length
        console.log('Extending reference_number column length...');
        await connection.execute(`
            ALTER TABLE payments 
            MODIFY COLUMN reference_number VARCHAR(50) UNIQUE NOT NULL
        `);
        console.log('✅ Reference number column extended to VARCHAR(50)');

        // Update payment_type enum to include 'monthly'
        console.log('Updating payment_type enum...');
        await connection.execute(`
            ALTER TABLE payments 
            MODIFY COLUMN payment_type ENUM('registration', 'annual', 'monthly') DEFAULT 'annual'
        `);
        console.log('✅ Payment type enum updated to include monthly');

        // Show final structure
        const [columns] = await connection.execute("DESCRIBE payments");
        console.log('\n📋 Updated table structure:');
        console.table(columns.filter(col =>
            ['reference_number', 'payment_type'].includes(col.Field)
        ));

        console.log('\n✅ Payment table constraints fixed successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the function
fixPaymentTableConstraints();
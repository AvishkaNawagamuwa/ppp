const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function debugPaymentStatus() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Test inserting different payment_status values
        const testValues = ['completed', 'pending_approval', 'failed', 'rejected'];

        for (const status of testValues) {
            try {
                console.log(`\nTesting payment_status: '${status}'`);

                // Try to insert with this status
                const [result] = await connection.execute(`
                    INSERT INTO payments (spa_id, payment_type, payment_method, amount, reference_number, payment_status)
                    VALUES (1, 'test', 'card', 100.00, 'TEST123', ?)
                `, [status]);

                console.log(`✅ SUCCESS: Inserted payment with ID ${result.insertId}`);

                // Clean up - delete the test record
                await connection.execute('DELETE FROM payments WHERE id = ?', [result.insertId]);

            } catch (error) {
                console.log(`❌ ERROR with '${status}':`, error.message);
            }
        }

        // Test the exact query from our registration
        console.log('\n=== Testing exact registration query ===');
        try {
            const [result] = await connection.execute(`
                INSERT INTO payments (
                    spa_id, payment_type, payment_method, amount, reference_number, payment_status
                ) VALUES (?, 'registration', ?, 5000.00, ?, ?)
            `, [1, 'bank_transfer', 'TEST456', 'pending_approval']);

            console.log('✅ Registration query SUCCESS:', result.insertId);
            await connection.execute('DELETE FROM payments WHERE id = ?', [result.insertId]);

        } catch (error) {
            console.log('❌ Registration query ERROR:', error.message);
        }

        await connection.end();

    } catch (error) {
        console.error('Connection error:', error);
    }
}

debugPaymentStatus();
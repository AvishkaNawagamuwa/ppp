const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function createSimpleTestData() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Clear existing test data
        await connection.execute('DELETE FROM payments WHERE reference_number LIKE "TEST%"');
        console.log('Cleared previous test data');

        // Get some spa IDs
        const [spas] = await connection.execute('SELECT id FROM spas LIMIT 5');

        if (spas.length === 0) {
            console.log('No spas found. Please ensure spas are registered first.');
            return;
        }

        console.log(`Found ${spas.length} spas`);

        // Insert simple test payments using existing columns structure
        const testPayments = [
            // Completed payments (using payment_status instead of status)
            { spa_id: spas[0].id, payment_type: 'registration', payment_method: 'card', amount: 5000, payment_status: 'completed', created_at: '2025-01-15' },
            { spa_id: spas[1].id, payment_type: 'annual', payment_method: 'bank_transfer', amount: 45000, payment_status: 'completed', bank_slip_path: '/uploads/slip1.jpg', created_at: '2025-02-10' },
            { spa_id: spas[2].id, payment_type: 'registration', payment_method: 'card', amount: 5000, payment_status: 'completed', created_at: '2025-03-05' },
            { spa_id: spas[0].id, payment_type: 'annual', payment_method: 'bank_transfer', amount: 45000, payment_status: 'completed', bank_slip_path: '/uploads/slip2.jpg', created_at: '2025-04-12' },
            { spa_id: spas[3].id, payment_type: 'registration', payment_method: 'card', amount: 5000, payment_status: 'completed', created_at: '2025-05-20' },
            { spa_id: spas[4].id, payment_type: 'annual', payment_method: 'bank_transfer', amount: 45000, payment_status: 'completed', bank_slip_path: '/uploads/slip3.jpg', created_at: '2025-06-15' },

            // Pending bank transfer approvals
            { spa_id: spas[1].id, payment_type: 'registration', payment_method: 'bank_transfer', amount: 5000, payment_status: 'pending_approval', bank_slip_path: '/uploads/pending1.jpg', created_at: '2025-10-01' },
            { spa_id: spas[2].id, payment_type: 'annual', payment_method: 'bank_transfer', amount: 45000, payment_status: 'pending_approval', bank_slip_path: '/uploads/pending2.jpg', created_at: '2025-10-05' },
            { spa_id: spas[3].id, payment_type: 'registration', payment_method: 'bank_transfer', amount: 5000, payment_status: 'pending_approval', bank_slip_path: '/uploads/pending3.jpg', created_at: '2025-10-08' },
        ];

        for (let i = 0; i < testPayments.length; i++) {
            const payment = testPayments[i];
            try {
                await connection.execute(`
                    INSERT INTO payments (
                        spa_id, payment_type, payment_method, amount, payment_status,
                        reference_number, bank_slip_path, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    payment.spa_id,
                    payment.payment_type,
                    payment.payment_method,
                    payment.amount,
                    payment.payment_status,
                    `TEST${Date.now()}${i}`,
                    payment.bank_slip_path || null,
                    payment.created_at
                ]);

                console.log(`✅ Inserted: ${payment.payment_type} - LKR ${payment.amount} - ${payment.payment_status}`);
            } catch (error) {
                console.error('Error inserting payment:', error.message);
            }
        }

        // Show summary
        const [summary] = await connection.execute(`
            SELECT 
                payment_type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                payment_status
            FROM payments 
            WHERE reference_number LIKE 'TEST%'
            GROUP BY payment_type, payment_status
            ORDER BY payment_type, payment_status
        `);

        console.log('\n📊 Test Payment Summary:');
        console.table(summary);

        console.log('\n✅ Test financial data inserted successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the function
createSimpleTestData();
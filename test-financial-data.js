const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function insertTestFinancialData() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check if payments table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'payments'");
        if (tables.length === 0) {
            console.log('Creating payments table...');
            await connection.execute(`
                CREATE TABLE payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    spa_id INT NOT NULL,
                    payment_type ENUM('registration', 'annual', 'monthly') DEFAULT 'registration',
                    payment_method ENUM('card', 'bank_transfer') NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
                    reference_number VARCHAR(50) UNIQUE NOT NULL,
                    
                    -- Bank transfer specific fields
                    bank_slip_path VARCHAR(500) NULL,
                    bank_transfer_approved BOOLEAN DEFAULT FALSE,
                    approval_date TIMESTAMP NULL,
                    approved_by VARCHAR(100) NULL,
                    rejection_reason TEXT NULL,
                    
                    -- Card payment specific fields
                    payhere_order_id VARCHAR(100) NULL,
                    payhere_payment_id VARCHAR(100) NULL,
                    
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE,
                    INDEX idx_payment_spa (spa_id),
                    INDEX idx_payment_status (status),
                    INDEX idx_payment_reference (reference_number)
                )
            `);
            console.log('✅ Payments table created');
        }

        // Get some spa IDs
        const [spas] = await connection.execute('SELECT id FROM spas LIMIT 5');

        if (spas.length === 0) {
            console.log('No spas found. Please ensure spas are registered first.');
            return;
        }

        console.log(`Found ${spas.length} spas`);

        // Insert test payment data
        const testPayments = [];

        for (let i = 0; i < 20; i++) {
            const spa = spas[Math.floor(Math.random() * spas.length)];
            const paymentTypes = ['registration', 'annual', 'monthly'];
            const paymentMethods = ['card', 'bank_transfer'];
            const statuses = ['completed', 'pending', 'completed', 'completed']; // More completed payments

            const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            let amount;
            switch (paymentType) {
                case 'registration':
                    amount = 5000.00;
                    break;
                case 'annual':
                    amount = 45000.00;
                    break;
                case 'monthly':
                    amount = 5000.00;
                    break;
            }

            // Generate random date in 2025
            const randomMonth = Math.floor(Math.random() * 10) + 1; // Jan-Oct 2025
            const randomDay = Math.floor(Math.random() * 28) + 1;
            const createdAt = `2025-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')} 10:00:00`;

            testPayments.push({
                spa_id: spa.id,
                payment_type: paymentType,
                payment_method: paymentMethod,
                amount,
                status: status,
                reference_number: `PAY${Date.now()}${i}`,
                bank_transfer_approved: paymentMethod === 'bank_transfer' && status === 'completed' ? 1 : (paymentMethod === 'bank_transfer' && status === 'pending' ? 0 : null),
                bank_slip_path: paymentMethod === 'bank_transfer' ? `/uploads/bank_slips/slip_${i}.jpg` : null,
                approved_by: status === 'completed' ? 'Admin LSA' : null,
                approval_date: status === 'completed' ? createdAt : null,
                created_at: createdAt
            });
        }

        // Insert payments
        for (const payment of testPayments) {
            try {
                await connection.execute(`
                    INSERT INTO payments (
                        spa_id, payment_type, payment_method, amount, status, reference_number,
                        bank_transfer_approved, bank_slip_path, approved_by, approval_date, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    payment.spa_id,
                    payment.payment_type,
                    payment.payment_method,
                    payment.amount,
                    payment.status,
                    payment.reference_number,
                    payment.bank_transfer_approved,
                    payment.bank_slip_path,
                    payment.approved_by,
                    payment.approval_date,
                    payment.created_at
                ]);

                console.log(`✅ Inserted payment: ${payment.payment_type} - ${payment.amount} - ${payment.status}`);
            } catch (error) {
                if (error.code !== 'ER_DUP_ENTRY') {
                    console.error('Error inserting payment:', error);
                }
            }
        }

        // Insert some pending bank transfers for approval
        const pendingBankTransfers = [];
        for (let i = 0; i < 5; i++) {
            const spa = spas[Math.floor(Math.random() * spas.length)];
            const paymentTypes = ['registration', 'annual'];
            const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];

            const amount = paymentType === 'registration' ? 5000.00 : 45000.00;

            pendingBankTransfers.push({
                spa_id: spa.id,
                payment_type: paymentType,
                payment_method: 'bank_transfer',
                amount,
                status: 'pending',
                reference_number: `PEND${Date.now()}${i}`,
                bank_transfer_approved: 0,
                bank_slip_path: `/uploads/bank_slips/pending_slip_${i}.jpg`,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        }

        for (const payment of pendingBankTransfers) {
            try {
                await connection.execute(`
                    INSERT INTO payments (
                        spa_id, payment_type, payment_method, amount, status, reference_number,
                        bank_transfer_approved, bank_slip_path, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    payment.spa_id,
                    payment.payment_type,
                    payment.payment_method,
                    payment.amount,
                    payment.status,
                    payment.reference_number,
                    payment.bank_transfer_approved,
                    payment.bank_slip_path,
                    payment.created_at
                ]);

                console.log(`✅ Inserted pending bank transfer: ${payment.payment_type} - ${payment.amount}`);
            } catch (error) {
                if (error.code !== 'ER_DUP_ENTRY') {
                    console.error('Error inserting pending payment:', error);
                }
            }
        }

        // Show summary
        const [summary] = await connection.execute(`
            SELECT 
                payment_type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                status
            FROM payments 
            GROUP BY payment_type, status
            ORDER BY payment_type, status
        `);

        console.log('\n📊 Payment Summary:');
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
insertTestFinancialData();
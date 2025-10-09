const mysql = require('mysql2/promise');

// Test the exact connection and query that should work
async function testActualRegistration() {
    const dbConfig = {
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'lsa_spa_management'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Test data similar to what the form sends
        const testData = {
            spaName: 'Test Spa',
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@test.com',
            spaTelephone: '1234567890',
            spaAddressLine1: 'Test Address',
            spaAddressLine2: 'Line 2',
            spaProvince: 'Western',
            spaPostalCode: '12345',
            paymentMethod: 'bank_transfer'
        };

        // First test the spas table insert
        console.log('\n=== Testing SPAS table insert ===');
        const fullAddress = `${testData.spaAddressLine1}${testData.spaAddressLine2 ? ', ' + testData.spaAddressLine2 : ''}, ${testData.spaProvince} ${testData.spaPostalCode}`;

        try {
            const [spaResult] = await connection.execute(`
                INSERT INTO spas (name, owner_fname, owner_lname, email, phone, address, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [testData.spaName, testData.firstName, testData.lastName, testData.email, testData.spaTelephone, fullAddress, 'pending']);

            console.log('✅ Spas INSERT SUCCESS! Spa ID:', spaResult.insertId);
            const spaId = spaResult.insertId;

            // Generate reference number
            const referenceNumber = `LSA${String(spaId).padStart(4, '0')}`;
            await connection.execute(`
                UPDATE spas SET reference_number = ? WHERE id = ?
            `, [referenceNumber, spaId]);
            console.log('✅ Reference number updated:', referenceNumber);

            // Test payments table insert
            console.log('\n=== Testing PAYMENTS table insert ===');
            const paymentRef = `REG000001`; // Max 10 chars
            const paymentStatus = 'pending_approval'; try {
                const [paymentResult] = await connection.execute(`
                    INSERT INTO payments (
                        spa_id, payment_type, payment_method, amount, reference_number, payment_status
                    ) VALUES (?, 'registration', ?, 5000.00, ?, ?)
                `, [spaId, testData.paymentMethod, paymentRef, paymentStatus]);

                console.log('✅ Payments INSERT SUCCESS! Payment ID:', paymentResult.insertId);

                // Clean up
                await connection.execute('DELETE FROM payments WHERE id = ?', [paymentResult.insertId]);
                await connection.execute('DELETE FROM spas WHERE id = ?', [spaId]);
                console.log('✅ Test records cleaned up');

            } catch (paymentError) {
                console.log('❌ Payments INSERT FAILED:', paymentError.message);
                // Clean up spa record
                await connection.execute('DELETE FROM spas WHERE id = ?', [spaId]);
            }

        } catch (spaError) {
            console.log('❌ Spas INSERT FAILED:', spaError.message);
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

testActualRegistration();
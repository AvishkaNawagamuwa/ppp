// Direct database test for add therapist functionality
const db = require('./config/database');

async function testDirectInsert() {
    try {
        console.log('🧪 Testing direct therapist insertion...');

        // Test data
        const testData = {
            spa_id: 1,
            name: 'Test User Full',
            first_name: 'Test',
            last_name: 'User',
            date_of_birth: '1990-01-15',
            nic: '901234567V',
            nic_number: '901234567V',
            email: 'test.user@spa.com',
            phone: '+94771234567',
            address: 'Test Address',
            specializations: JSON.stringify(['Swedish Massage', 'Aromatherapy']),
            experience_years: 2,
            status: 'pending'
        };

        // Insert therapist with all new fields
        const [result] = await db.execute(`
            INSERT INTO therapists (
                spa_id, name, first_name, last_name, date_of_birth, nic, nic_number,
                email, phone, address, specializations, experience_years, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
            testData.spa_id, testData.name, testData.first_name, testData.last_name,
            testData.date_of_birth, testData.nic, testData.nic_number,
            testData.email, testData.phone, testData.address,
            testData.specializations, testData.experience_years
        ]);

        console.log('✅ Therapist inserted successfully! ID:', result.insertId);

        // Verify the insert
        const [rows] = await db.execute(
            'SELECT * FROM therapists WHERE id = ?',
            [result.insertId]
        );

        if (rows.length > 0) {
            console.log('📋 Inserted therapist data:');
            console.log('- ID:', rows[0].id);
            console.log('- Name:', rows[0].first_name, rows[0].last_name);
            console.log('- NIC:', rows[0].nic_number);
            console.log('- Phone:', rows[0].phone);
            console.log('- Date of Birth:', rows[0].date_of_birth);
            console.log('- Status:', rows[0].status);
            console.log('- Specializations:', JSON.parse(rows[0].specializations || '[]'));
        }

        // Clean up test data
        await db.execute('DELETE FROM therapists WHERE id = ?', [result.insertId]);
        console.log('🧹 Test data cleaned up');

        console.log('✨ All database operations working correctly!');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        process.exit(0);
    }
}

testDirectInsert();
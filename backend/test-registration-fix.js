const mysql = require('mysql2/promise');
const config = require('./config/database');

async function testRegistrationDB() {
    let connection;

    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Test if spas table exists and check its structure
        console.log('\n🔍 Checking spas table structure...');
        const [columns] = await connection.execute('DESCRIBE spas');
        console.log('Spas table columns:');
        columns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
        });

        // Test if payments table exists
        console.log('\n🔍 Checking payments table structure...');
        const [paymentColumns] = await connection.execute('DESCRIBE payments');
        console.log('Payments table columns:');
        paymentColumns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
        });

        // Test basic INSERT to see if it works
        console.log('\n🧪 Testing basic spa INSERT...');
        const testData = [
            'Test Spa Name',
            'BR12345678',
            '0112345678',
            'John',
            'Doe',
            `test${Date.now()}@example.com`,
            '123456789V',
            '0112345678',
            '0771234567',
            '123 Test Street',
            'Test Line 2',
            'Western',
            '10100',
            null, null, null, null, null,
            '[]',
            '[]'
        ];

        const [result] = await connection.execute(`
            INSERT INTO spas (
                name, spa_br_number, spa_tel,
                owner_fname, owner_lname, owner_email, owner_nic, owner_tel, owner_cell,
                address_line1, address_line2, province, postal_code,
                nic_front_path, nic_back_path, br_attachment_path, tax_registration_path, other_doc_path,
                facility_photos, professional_certifications,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, testData);

        console.log(`✅ Test spa inserted with ID: ${result.insertId}`);

        // Clean up test data
        await connection.execute('DELETE FROM spas WHERE id = ?', [result.insertId]);
        console.log('🧹 Test data cleaned up');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testRegistrationDB();
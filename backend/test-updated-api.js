const mysql = require('mysql2/promise');

async function testUpdatedAPI() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'lsa_spa_management'
    });

    try {
        console.log('Testing updated therapist search query...');
        const [results] = await db.execute(`
      SELECT 
        t.id,
        t.name,
        t.first_name,
        t.last_name,
        t.nic_number,
        t.phone,
        t.email,
        t.specialization,
        t.status,
        s.name as spa_name
      FROM therapists t
      LEFT JOIN spas s ON t.spa_id = s.id
      ORDER BY t.id DESC
      LIMIT 5
    `);

        console.log('✓ Query successful! Found', results.length, 'therapists');

        if (results.length > 0) {
            console.log('\n--- Sample Therapist Data ---');
            const therapist = results[0];
            console.log('ID:', therapist.id);
            console.log('Name:', therapist.name);
            console.log('First Name:', therapist.first_name);
            console.log('Last Name:', therapist.last_name);
            console.log('NIC Number:', therapist.nic_number);
            console.log('Phone:', therapist.phone);
            console.log('Email:', therapist.email);
            console.log('Specialization:', therapist.specialization);
            console.log('Status:', therapist.status);
            console.log('Spa Name:', therapist.spa_name);
        }

        // Test detailed query for specific therapist
        console.log('\n--- Testing Detailed Therapist Query ---');
        const [detailResults] = await db.execute(`
      SELECT 
        t.*,
        s.name as current_spa_name
      FROM therapists t
      LEFT JOIN spas s ON t.spa_id = s.id
      WHERE t.id = ?
    `, [results[0].id]);

        if (detailResults.length > 0) {
            console.log('✓ Detailed query successful!');
            const detail = detailResults[0];
            console.log('Documents available:');
            console.log('- NIC Attachment:', detail.nic_attachment ? 'Yes' : 'No');
            console.log('- Medical Certificate:', detail.medical_certificate ? 'Yes' : 'No');
            console.log('- Spa Certificate:', detail.spa_center_certificate ? 'Yes' : 'No');
            console.log('- Therapist Image:', detail.therapist_image ? 'Yes' : 'No');
            console.log('- Working History:', detail.working_history ? 'Yes' : 'No');
        }

    } catch (error) {
        console.error('❌ Database test error:', error.message);
    } finally {
        await db.end();
    }
}

testUpdatedAPI();
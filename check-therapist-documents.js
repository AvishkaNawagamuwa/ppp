const mysql = require('mysql2/promise');

async function checkTherapistDocuments() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management',
            port: 3306
        });

        console.log('📋 Checking therapists with documents...\n');

        const [rows] = await connection.execute(`
            SELECT id, name, first_name, last_name, 
                   nic_attachment, medical_certificate, spa_center_certificate, therapist_image 
            FROM therapists 
            WHERE (nic_attachment IS NOT NULL 
                   OR medical_certificate IS NOT NULL 
                   OR spa_center_certificate IS NOT NULL 
                   OR therapist_image IS NOT NULL) 
            LIMIT 5
        `);

        console.log(`Found ${rows.length} therapists with documents:`);

        rows.forEach((row, index) => {
            console.log(`\n${index + 1}. ID: ${row.id}, Name: ${row.name || `${row.first_name} ${row.last_name}`}`);
            console.log(`   nic_attachment: ${row.nic_attachment || 'NULL'}`);
            console.log(`   medical_certificate: ${row.medical_certificate || 'NULL'}`);
            console.log(`   spa_center_certificate: ${row.spa_center_certificate || 'NULL'}`);
            console.log(`   therapist_image: ${row.therapist_image || 'NULL'}`);
        });

        // Also check the API response format
        console.log('\n📡 Testing API response format...');
        const testId = rows[0]?.id;
        if (testId) {
            const [apiTest] = await connection.execute(`
                SELECT id, name, first_name, last_name,
                       nic_attachment, medical_certificate, spa_center_certificate, therapist_image,
                       status
                FROM therapists WHERE id = ?
            `, [testId]);

            console.log('\nAPI format test for ID', testId, ':');
            console.log(JSON.stringify(apiTest[0], null, 2));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTherapistDocuments();
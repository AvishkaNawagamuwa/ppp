const mysql = require('mysql2/promise');

async function testJsonParsing() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        // Get Sumith's record with proper JSON parsing
        const [rows] = await connection.execute(`
            SELECT 
                id as spa_id,
                name as spa_name,
                CONCAT(COALESCE(owner_fname, ''), ' ', COALESCE(owner_lname, '')) as owner_name,
                status,
                verification_status,
                form1_certificate_path,
                nic_front_path,
                nic_back_path,
                br_attachment_path,
                other_document_path,
                spa_banner_photos_path
            FROM spas 
            WHERE id = 42
        `);

        if (rows.length > 0) {
            const spa = rows[0];
            console.log('Raw data from database:');
            console.log('- Form1 raw:', spa.form1_certificate_path);
            console.log('- NIC Front raw:', spa.nic_front_path);
            console.log('- NIC Back raw:', spa.nic_back_path);

            // Apply JSON parsing logic
            const parseJsonField = (field) => {
                if (!field) return null;
                try {
                    const parsed = JSON.parse(field);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed[0]; // Return first file path
                    }
                    return field; // Return as is if not JSON array
                } catch (e) {
                    return field; // Return original value if not valid JSON
                }
            };

            console.log('\\nAfter JSON parsing:');
            console.log('- Form1 parsed:', parseJsonField(spa.form1_certificate_path));
            console.log('- NIC Front parsed:', parseJsonField(spa.nic_front_path));
            console.log('- NIC Back parsed:', parseJsonField(spa.nic_back_path));
            console.log('- BR Attachment parsed:', parseJsonField(spa.br_attachment_path));
            console.log('- Other Docs parsed:', parseJsonField(spa.other_document_path));
            console.log('- Spa Banner parsed:', parseJsonField(spa.spa_banner_photos_path));
        }

        await connection.end();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testJsonParsing();
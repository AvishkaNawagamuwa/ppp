const mysql = require('mysql2/promise');

async function testSpaData() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('=== TEST SPA DATA RETRIEVAL ===');

        // Test the same query as in SpaModel.getAllSpas
        const query = `
            SELECT 
                id as spa_id,
                name as spa_name,
                owner_fname,
                owner_lname,
                CONCAT(COALESCE(owner_fname, ''), ' ', COALESCE(owner_lname, '')) as owner_name,
                email,
                phone,
                address,
                reference_number,
                status,
                verification_status,
                payment_status,
                annual_payment_status,
                payment_method,
                next_payment_date,
                blacklist_reason,
                blacklisted_at,
                blacklisted_by,
                certificate_path,
                form1_certificate_path,
                spa_banner_photos_path,
                spa_photos_banner,
                spa_photos_banner_path,
                nic_front_path,
                nic_back_path,
                br_attachment_path,
                other_document_path,
                annual_fee_paid,
                created_at,
                updated_at,
                registration_date
            FROM spas
            LIMIT 3
        `;

        const [rows] = await connection.execute(query);

        if (rows.length > 0) {
            console.log(`Found ${rows.length} spa records:`);
            rows.forEach((spa, index) => {
                console.log(`\n--- SPA ${index + 1}: ${spa.spa_name} ---`);
                console.log(`ID: ${spa.spa_id}`);
                console.log(`Owner: ${spa.owner_name}`);
                console.log(`Email: ${spa.email}`);
                console.log(`Phone: ${spa.phone}`);
                console.log(`Status: ${spa.status}`);
                console.log(`Verification: ${spa.verification_status || 'NULL'}`);

                console.log('\nDocument Paths:');
                console.log(`- Certificate: ${spa.certificate_path || 'NULL'}`);
                console.log(`- Form1 Certificate: ${spa.form1_certificate_path || 'NULL'}`);
                console.log(`- NIC Front: ${spa.nic_front_path || 'NULL'}`);
                console.log(`- NIC Back: ${spa.nic_back_path || 'NULL'}`);
                console.log(`- BR Attachment: ${spa.br_attachment_path || 'NULL'}`);
                console.log(`- Other Documents: ${spa.other_document_path || 'NULL'}`);
                console.log(`- Spa Banner Photos: ${spa.spa_banner_photos_path || 'NULL'}`);
            });
        } else {
            console.log('No spa records found');
        }

        await connection.end();

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSpaData();
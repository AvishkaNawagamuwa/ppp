const mysql = require('mysql2/promise');

async function findSumithData() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        // Search for Sumith Nawagamuwa
        const [rows] = await connection.execute(`
            SELECT * FROM spas 
            WHERE name LIKE '%sumith%' 
               OR owner_fname LIKE '%sumith%' 
               OR owner_lname LIKE '%nawagamuwa%'
               OR CONCAT(owner_fname, ' ', owner_lname) LIKE '%sumith%'
        `);

        if (rows.length > 0) {
            console.log(`Found ${rows.length} record(s) for Sumith:`);
            rows.forEach((spa, index) => {
                console.log(`\n--- RECORD ${index + 1} ---`);
                console.log('ID:', spa.id);
                console.log('Name:', spa.name);
                console.log('Owner:', spa.owner_fname, spa.owner_lname);
                console.log('Email:', spa.email);
                console.log('Phone:', spa.phone);
                console.log('Status:', spa.status);
                console.log('Verification:', spa.verification_status);
                console.log('\nDocument Paths:');
                console.log('- Certificate:', spa.certificate_path || 'NULL');
                console.log('- Form1:', spa.form1_certificate_path || 'NULL');
                console.log('- NIC Front:', spa.nic_front_path || 'NULL');
                console.log('- NIC Back:', spa.nic_back_path || 'NULL');
                console.log('- BR Attachment:', spa.br_attachment_path || 'NULL');
                console.log('- Other Docs:', spa.other_document_path || 'NULL');
                console.log('- Spa Banner:', spa.spa_banner_photos_path || 'NULL');
                console.log('- Spa Photos Banner:', spa.spa_photos_banner || 'NULL');
            });
        } else {
            console.log('No Sumith record found. Showing all records:');
            const [allRows] = await connection.execute('SELECT id, name, owner_fname, owner_lname, email FROM spas');
            allRows.forEach(row => {
                console.log(`${row.id}: ${row.name} - ${row.owner_fname} ${row.owner_lname} (${row.email})`);
            });
        }

        await connection.end();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findSumithData();
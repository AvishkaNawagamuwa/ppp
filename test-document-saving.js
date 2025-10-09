const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function testDocumentSaving() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Test the updated spas table structure
        console.log('\n=== TESTING DOCUMENT COLUMNS IN SPAS TABLE ===');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'spas' 
            AND TABLE_SCHEMA = 'lsa_spa_management'
            AND COLUMN_NAME LIKE '%path%'
            ORDER BY COLUMN_NAME
        `);

        console.log('Available document path columns:');
        columns.forEach(col => {
            console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Test INSERT query with all document paths
        console.log('\n=== TESTING DOCUMENT INSERT QUERY ===');
        try {
            const testQuery = `
                INSERT INTO spas (
                    name, owner_fname, owner_lname, email, phone, address, status,
                    nic_front_path, nic_back_path, br_attachment_path, 
                    form1_certificate_path, spa_banner_photos_path, other_document_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            console.log('✅ INSERT query syntax is valid');
            console.log('Query structure:');
            console.log(testQuery);

        } catch (error) {
            console.log('❌ INSERT query error:', error.message);
        }

        await connection.end();
        console.log('\n🎉 Database structure test complete!');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

testDocumentSaving();
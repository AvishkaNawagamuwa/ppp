const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkDocumentColumns() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check spas table structure for document columns
        console.log('\n=== SPAS TABLE - DOCUMENT RELATED COLUMNS ===');
        const [columns] = await connection.execute('DESCRIBE spas');

        const documentColumns = columns.filter(col =>
            col.Field.includes('path') ||
            col.Field.includes('document') ||
            col.Field.includes('certificate') ||
            col.Field.includes('photo') ||
            col.Field.includes('banner') ||
            col.Field.includes('nic') ||
            col.Field.includes('br')
        );

        if (documentColumns.length > 0) {
            console.log('Existing document columns:');
            documentColumns.forEach(col => {
                console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        } else {
            console.log('No document-specific columns found');
        }

        // Check if we need to add columns for missing documents
        const requiredDocuments = [
            'nic_front_path',
            'nic_back_path',
            'br_attachment_path',
            'form1_certificate_path', // Already exists
            'spa_banner_path',
            'other_document_path'
        ];

        console.log('\n=== REQUIRED DOCUMENT COLUMNS ===');
        requiredDocuments.forEach(docCol => {
            const exists = columns.some(col => col.Field === docCol);
            console.log(`   ${docCol}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

        await connection.end();

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

checkDocumentColumns();
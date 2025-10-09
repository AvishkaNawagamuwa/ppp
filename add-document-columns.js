const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function addDocumentColumns() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Add missing document columns to spas table
        const columnsToAdd = [
            'nic_front_path VARCHAR(500) NULL',
            'nic_back_path VARCHAR(500) NULL',
            'br_attachment_path VARCHAR(500) NULL',
            'other_document_path VARCHAR(500) NULL'
        ];

        console.log('\n=== ADDING MISSING DOCUMENT COLUMNS ===');

        for (const column of columnsToAdd) {
            try {
                const columnName = column.split(' ')[0];
                await connection.execute(`ALTER TABLE spas ADD COLUMN ${column}`);
                console.log(`✅ Added column: ${columnName}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  Column ${column.split(' ')[0]} already exists`);
                } else {
                    console.log(`❌ Error adding ${column.split(' ')[0]}: ${error.message}`);
                }
            }
        }

        // Verify all columns were added
        console.log('\n=== VERIFYING DOCUMENT COLUMNS ===');
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

        documentColumns.forEach(col => {
            console.log(`   ✅ ${col.Field}: ${col.Type}`);
        });

        await connection.end();
        console.log('\n🎉 Document columns setup complete!');

    } catch (error) {
        console.error('❌ Database operation failed:', error.message);
    }
}

addDocumentColumns();

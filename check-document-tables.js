const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkDocumentTables() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check for tables related to documents
        const [tables] = await connection.execute("SHOW TABLES LIKE '%document%'");
        console.log('\n=== TABLES RELATED TO DOCUMENTS ===');
        if (tables.length > 0) {
            tables.forEach(table => {
                console.log(`- ${Object.values(table)[0]}`);
            });
        } else {
            console.log('No document-related tables found');
        }

        // Check for tables related to files
        const [fileTables] = await connection.execute("SHOW TABLES LIKE '%file%'");
        console.log('\n=== TABLES RELATED TO FILES ===');
        if (fileTables.length > 0) {
            fileTables.forEach(table => {
                console.log(`- ${Object.values(table)[0]}`);
            });
        } else {
            console.log('No file-related tables found');
        }

        // Show all tables to see what's available
        const [allTables] = await connection.execute("SHOW TABLES");
        console.log('\n=== ALL TABLES IN DATABASE ===');
        allTables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

        await connection.end();

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

checkDocumentTables();
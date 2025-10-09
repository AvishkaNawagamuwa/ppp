const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkSpasTableStructure() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check the CREATE TABLE statement for spas table
        const [rows] = await connection.execute('SHOW CREATE TABLE spas');
        console.log('\n=== SPAS TABLE DEFINITION ===');
        console.log(rows[0]['Create Table']);

        // Also check column names
        const [columns] = await connection.execute('DESCRIBE spas');
        console.log('\n=== SPAS TABLE COLUMNS ===');
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        await connection.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

checkSpasTableStructure();
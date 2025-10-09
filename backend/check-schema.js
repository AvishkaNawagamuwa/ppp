const mysql = require('mysql2/promise');

async function checkDatabaseSchema() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('Connected to database...');

        // Get table structure
        const [columns] = await connection.execute('DESCRIBE therapists');
        console.log('\nTherapists table structure:');
        columns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
        });

        // Get a sample record to see actual data
        const [sample] = await connection.execute('SELECT * FROM therapists LIMIT 1');
        if (sample.length > 0) {
            console.log('\nSample therapist record:');
            console.log(JSON.stringify(sample[0], null, 2));
        }

        await connection.end();

    } catch (error) {
        console.error('Database error:', error);
    }
}

checkDatabaseSchema();
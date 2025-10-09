const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function testDBConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database: lsa_spa_management');

        // Show all databases
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('\n=== AVAILABLE DATABASES ===');
        databases.forEach(db => {
            console.log(`- ${db.Database}`);
        });

        // Check current database
        const [currentDB] = await connection.execute('SELECT DATABASE() as current_db');
        console.log(`\n✅ Currently using database: ${currentDB[0].current_db}`);

        // Try a simple insert to spas table to test if our query works
        console.log('\n=== TESTING SPAS TABLE INSERT ===');
        try {
            const [result] = await connection.execute(`
                INSERT INTO spas (name, owner_fname, owner_lname, email, phone, address, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ['Test Spa', 'Test', 'User', 'test@test.com', '1234567890', 'Test Address', 'pending']);

            console.log('✅ INSERT SUCCESS! Spa ID:', result.insertId);

            // Clean up - delete the test record
            await connection.execute('DELETE FROM spas WHERE id = ?', [result.insertId]);
            console.log('✅ Test record cleaned up');

        } catch (error) {
            console.log('❌ INSERT FAILED:', error.message);
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

testDBConnection();
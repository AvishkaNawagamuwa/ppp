const mysql = require('mysql2/promise');

async function checkSpasTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('=== SPAS TABLE STRUCTURE ===');
        const [columns] = await connection.execute('DESCRIBE spas');
        columns.forEach(col => console.log(`${col.Field} (${col.Type})`));

        console.log('\n=== SAMPLE RECORD FOR SUMITH NAWAGAMUWA ===');
        const [rows] = await connection.execute(`SELECT * FROM spas WHERE spa_name LIKE '%sumith%' OR owner_name LIKE '%sumith%' LIMIT 1`);
        if (rows.length > 0) {
            console.log('Fields with data:');
            Object.entries(rows[0]).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    console.log(`${key}: ${value}`);
                }
            });
        } else {
            console.log('No records found for Sumith');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSpasTable();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkPaymentTypeEnum() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check the CREATE TABLE statement to see payment_type ENUM
        const [rows] = await connection.execute('SHOW CREATE TABLE payments');
        console.log('\n=== PAYMENTS TABLE DEFINITION ===');
        console.log(rows[0]['Create Table']);

        await connection.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPaymentTypeEnum();
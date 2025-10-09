// Test the exact same INSERT as setup.js
const express = require('express');
const app = express();

app.get('/test-insert', async (req, res) => {
    const db = require('./config/database');

    try {
        const connection = await db.getConnection();

        // Test the EXACT same query as setup.js
        const [result] = await connection.execute(`
            INSERT INTO spas (name, email, phone, address, status) 
            VALUES (?, ?, ?, ?, ?)
        `, [`Test Spa ${Date.now()}`, `test${Date.now()}@example.com`, '+94771234567', '123 Test Address', 'pending']);

        console.log('INSERT successful! ID:', result.insertId);

        // Clean up test data
        await connection.execute('DELETE FROM spas WHERE id = ?', [result.insertId]);

        connection.release();

        res.json({
            success: true,
            message: 'INSERT test successful',
            insertId: result.insertId
        });
    } catch (error) {
        console.error('INSERT test failed:', error);
        res.json({
            success: false,
            error: error.message,
            sqlState: error.sqlState,
            code: error.code
        });
    }
});

app.listen(5003, () => {
    console.log('INSERT test server running on http://localhost:5003');
    console.log('Visit http://localhost:5003/test-insert to test INSERT query');
});
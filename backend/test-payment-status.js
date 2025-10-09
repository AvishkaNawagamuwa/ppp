// Test valid payment_status values
const express = require('express');
const app = express();

app.get('/test-payment-status/:status', async (req, res) => {
    const db = require('./config/database');
    const status = req.params.status;

    try {
        const connection = await db.getConnection();

        // Test INSERT with different payment_status values
        const [result] = await connection.execute(`
            INSERT INTO payments (spa_id, payment_type, payment_method, amount, reference_number, payment_status)
            VALUES (1, 'registration', 'bank_transfer', 100.00, ?, ?)
        `, [`TEST${Date.now()}`, status]);

        console.log(`Payment status '${status}' - SUCCESS! ID:`, result.insertId);

        // Clean up
        await connection.execute('DELETE FROM payments WHERE id = ?', [result.insertId]);

        connection.release();

        res.json({
            success: true,
            message: `Payment status '${status}' is valid`,
            insertId: result.insertId
        });
    } catch (error) {
        console.error(`Payment status '${status}' - FAILED:`, error.message);
        res.json({
            success: false,
            status: status,
            error: error.message,
            code: error.code
        });
    }
});

app.listen(5005, () => {
    console.log('Payment status test server running on http://localhost:5005');
    console.log('Test different values:');
    console.log('  http://localhost:5005/test-payment-status/pending');
    console.log('  http://localhost:5005/test-payment-status/paid');
    console.log('  http://localhost:5005/test-payment-status/unpaid');
    console.log('  http://localhost:5005/test-payment-status/processing');
});
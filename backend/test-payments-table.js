// Test payments table structure
const express = require('express');
const app = express();

app.get('/test-payments', async (req, res) => {
    const db = require('./config/database');

    try {
        const connection = await db.getConnection();

        // Get payments table structure
        const [paymentColumns] = await connection.execute('DESCRIBE payments');

        console.log('Payments table columns:', paymentColumns.map(col => col.Field));

        connection.release();

        res.json({
            success: true,
            columns: paymentColumns.map(col => ({
                name: col.Field,
                type: col.Type,
                null: col.Null
            }))
        });
    } catch (error) {
        console.error('Payments table error:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(5004, () => {
    console.log('Payments test server running on http://localhost:5004');
    console.log('Visit http://localhost:5004/test-payments to see payments table structure');
});
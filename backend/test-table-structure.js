// Simple script to get the actual database table structure
const express = require('express');
const app = express();

// Simple test endpoint to get table structure
app.get('/test/spas-columns', async (req, res) => {
    const db = require('./config/database');

    try {
        const connection = await db.getConnection();
        const [columns] = await connection.execute('DESCRIBE spas');
        connection.release();

        console.log('Actual spas table columns:', columns.map(col => col.Field));
        res.json({
            success: true,
            columns: columns.map(col => ({
                name: col.Field,
                type: col.Type,
                null: col.Null,
                key: col.Key,
                default: col.Default
            }))
        });
    } catch (error) {
        console.error('Database error:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(5001, () => {
    console.log('Test server running on http://localhost:5001');
    console.log('Visit http://localhost:5001/test/spas-columns to see actual table structure');
});
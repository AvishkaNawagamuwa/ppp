// Check ENUM values for payment_status
const express = require('express');
const app = express();

app.get('/check-enum', async (req, res) => {
    const db = require('./config/database');

    try {
        const connection = await db.getConnection();

        // Get the exact table definition to see ENUM values
        const [createTable] = await connection.execute('SHOW CREATE TABLE payments');
        const tableDefinition = createTable[0]['Create Table'];

        console.log('Payments table definition:');
        console.log(tableDefinition);

        // Extract payment_status ENUM values
        const enumMatch = tableDefinition.match(/`payment_status`\s+enum\((.*?)\)/i);
        let enumValues = [];
        if (enumMatch) {
            enumValues = enumMatch[1].split(',').map(v => v.replace(/'/g, '').trim());
        }

        connection.release();

        res.json({
            success: true,
            tableDefinition: tableDefinition,
            enumValues: enumValues
        });
    } catch (error) {
        console.error('Error checking ENUM:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(5006, () => {
    console.log('ENUM check server running on http://localhost:5006');
    console.log('Visit http://localhost:5006/check-enum to see ENUM values');
});
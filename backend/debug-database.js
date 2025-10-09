// Advanced database investigation
const express = require('express');
const app = express();

app.get('/debug/tables', async (req, res) => {
    const db = require('./config/database');

    try {
        const connection = await db.getConnection();

        // Get current database name
        const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');

        // Get all tables
        const [tables] = await connection.execute('SHOW TABLES');

        // Find all tables with "spa" in the name
        const [spaTables] = await connection.execute("SHOW TABLES LIKE '%spa%'");

        // Get the structure of main spas table
        const [spaColumns] = await connection.execute('DESCRIBE spas');

        // Test a simple SELECT to see what works
        const [sampleData] = await connection.execute('SELECT * FROM spas LIMIT 1');

        connection.release();

        console.log('Database info:', {
            database: dbResult[0].current_db,
            allTables: tables.length,
            spaTables: spaTables.map(t => Object.values(t)[0]),
            spaColumns: spaColumns.map(col => col.Field),
            sampleRecord: sampleData[0] || 'No records found'
        });

        res.json({
            success: true,
            database: dbResult[0].current_db,
            allTables: tables.map(t => Object.values(t)[0]),
            spaTables: spaTables.map(t => Object.values(t)[0]),
            spaColumns: spaColumns.map(col => ({
                name: col.Field,
                type: col.Type,
                null: col.Null
            })),
            sampleRecord: sampleData[0] || null
        });
    } catch (error) {
        console.error('Database error:', error);
        res.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.listen(5002, () => {
    console.log('Debug server running on http://localhost:5002');
    console.log('Visit http://localhost:5002/debug/tables for detailed database info');
});
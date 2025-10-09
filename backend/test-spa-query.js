const db = require('./config/database');

async function testSpaProfileQuery() {
    try {
        console.log('Testing SPA profile query...');
        const [rows] = await db.execute(`
            SELECT 
                id,
                name as spa_name,
                CONCAT(owner_fname, ' ', owner_lname) as owner_name,
                email,
                phone,
                address,
                address as district,
                status,
                created_at,
                updated_at
            FROM spas 
            WHERE id = ? AND status = ?
        `, [1, 'verified']);

        console.log('Query result:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Query Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testSpaProfileQuery();
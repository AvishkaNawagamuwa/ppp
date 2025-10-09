const db = require('./config/database');

async function testDirectQuery() {
    try {
        console.log('🔍 Testing direct database query...');

        // Test basic connection
        const [testRows] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection works:', testRows);

        // Test therapists table exists
        const [tables] = await db.execute("SHOW TABLES LIKE 'therapists'");
        console.log('📋 Therapists table exists:', tables.length > 0);

        // Test simple count
        const [countRows] = await db.execute('SELECT COUNT(*) as count FROM therapists');
        console.log('📊 Total therapists count:', countRows[0].count);

        // Test the exact query from our model
        const query = `
            SELECT t.*, s.name as spa_name, s.owner_fname, s.owner_lname 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id
            ORDER BY t.created_at DESC
        `;

        console.log('🔍 Testing exact query from model...');
        const [therapistRows] = await db.execute(query);
        console.log('📊 Query result count:', therapistRows.length);

        if (therapistRows.length > 0) {
            console.log('🎯 First therapist:', {
                id: therapistRows[0].id,
                name: therapistRows[0].name,
                status: therapistRows[0].status,
                spa_name: therapistRows[0].spa_name
            });
        }

        // Test with status filter
        const queryWithStatus = `
            SELECT t.*, s.name as spa_name, s.owner_fname, s.owner_lname 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id
            WHERE t.status = ?
            ORDER BY t.created_at DESC
        `;

        const [pendingRows] = await db.execute(queryWithStatus, ['pending']);
        console.log('📊 Pending therapists count:', pendingRows.length);

    } catch (error) {
        console.error('❌ Database test error:', error);
    }
}

testDirectQuery();
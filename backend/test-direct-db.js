const db = require('./config/database');

async function testDirectQuery() {
    try {
        console.log('🔍 Testing direct database query...');

        // Test basic connection
        const [testResult] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection test:', testResult);

        // Test therapists table exists
        const [tableCheck] = await db.execute('SHOW TABLES LIKE "therapists"');
        console.log('📋 Therapists table exists:', tableCheck.length > 0);

        // Test simple count
        const [countResult] = await db.execute('SELECT COUNT(*) as total FROM therapists');
        console.log('🔢 Total therapists count:', countResult[0].total);

        // Test basic select
        const [therapists] = await db.execute('SELECT id, name, status FROM therapists LIMIT 5');
        console.log('👥 Sample therapists:', therapists.length);

        if (therapists.length > 0) {
            console.log('🎯 First therapist sample:', therapists[0]);
        }

        // Test the exact query from TherapistModel
        const query = `
            SELECT t.*, s.name as spa_name, s.owner_fname, s.owner_lname 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id
            ORDER BY t.created_at DESC
        `;

        console.log('🔍 Testing exact TherapistModel query...');
        const [exactResult] = await db.execute(query);
        console.log('📊 Exact query result:', exactResult.length, 'rows');

        if (exactResult.length > 0) {
            console.log('🎯 First result from exact query:', {
                id: exactResult[0].id,
                name: exactResult[0].name,
                status: exactResult[0].status,
                spa_name: exactResult[0].spa_name
            });
        }

    } catch (error) {
        console.error('❌ Direct query test error:', error);
    }

    process.exit(0);
}

testDirectQuery();
const db = require('./config/database');

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    try {
        // Test basic query
        console.log('📝 Testing simple query...');
        const [testResult] = await db.execute('SELECT 1 as test');
        console.log('✅ Basic query result:', testResult);

        // Test therapists table structure
        console.log('📝 Testing therapists table...');
        const [countResult] = await db.execute('SELECT COUNT(*) as count FROM therapists');
        console.log('📊 Total therapists count:', countResult[0].count);

        // Test actual therapists query
        console.log('📝 Testing therapists query...');
        const [therapistsResult] = await db.execute(`
            SELECT t.*, s.name as spa_name, s.owner_fname, s.owner_lname 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id
            ORDER BY t.created_at DESC
        `);
        console.log('📊 Therapists query result count:', therapistsResult.length);

        if (therapistsResult.length > 0) {
            console.log('🎯 First therapist:', {
                id: therapistsResult[0].id,
                name: therapistsResult[0].name,
                status: therapistsResult[0].status,
                spa_name: therapistsResult[0].spa_name
            });
        }

        console.log('✅ Database test completed successfully');

    } catch (error) {
        console.error('❌ Database test failed:', error);
    }
}

testDatabaseConnection();
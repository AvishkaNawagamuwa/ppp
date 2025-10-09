// Direct database test to check spa data
const mysql = require('mysql2/promise');

const testDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('✅ Database connection successful');

        // Test basic spa query
        const [spas] = await connection.execute('SELECT COUNT(*) as count FROM spas');
        console.log(`📊 Total spas in database: ${spas[0].count}`);

        if (spas[0].count > 0) {
            // Get first few spas
            const [sampleSpas] = await connection.execute(
                'SELECT id, spa_name, name, verification_status FROM spas LIMIT 3'
            );

            console.log('\n📝 Sample spa data:');
            sampleSpas.forEach(spa => {
                console.log(`- ID: ${spa.id}, Name: ${spa.spa_name || spa.name}, Status: ${spa.verification_status}`);
            });

            // Test the exact query from the API
            const query = `
                SELECT s.*, 
                       COUNT(t.id) as therapist_count,
                       COUNT(CASE WHEN t.status = 'approved' THEN 1 END) as approved_therapists,
                       COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_therapists,
                       COUNT(CASE WHEN t.status = 'rejected' THEN 1 END) as rejected_therapists
                FROM spas s
                LEFT JOIN therapists t ON s.id = t.spa_id
                GROUP BY s.id 
                ORDER BY s.created_at DESC 
                LIMIT 3
            `;

            console.log('\n🔍 Testing API query...');
            const [apiResults] = await connection.execute(query);
            console.log(`✅ API query successful, returned ${apiResults.length} rows`);

            if (apiResults.length > 0) {
                console.log('\n📋 First result:');
                const first = apiResults[0];
                console.log(`- ID: ${first.id}`);
                console.log(`- Name: ${first.spa_name || first.name}`);
                console.log(`- Status: ${first.verification_status}`);
                console.log(`- Therapist count: ${first.therapist_count}`);
            }
        }

        await connection.end();
        console.log('\n✅ Database test completed successfully');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Full error:', error);
    }
};

testDatabase();
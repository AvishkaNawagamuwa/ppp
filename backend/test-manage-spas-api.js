// Test script to check ManageSpas API connectivity
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testManageSpasAPI() {
    console.log('🧪 Testing ManageSpas API connectivity...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health check:', healthResponse.data.status);

        // Test 2: Get spas list
        console.log('\n2️⃣ Testing spas list endpoint...');
        try {
            const spasResponse = await axios.get(`${BASE_URL}/api/lsa/spas`);
            console.log('✅ Spas endpoint working');
            console.log(`   Found ${spasResponse.data.data?.spas?.length || 0} spas`);
        } catch (error) {
            console.log('⚠️ Spas endpoint error:', error.response?.data || error.message);
        }

        // Test 3: Check database structure
        console.log('\n3️⃣ Testing database structure...');
        try {
            const db = require('../config/database');
            const [tables] = await db.execute('SHOW TABLES FROM lsa_spa_management');
            console.log('✅ Database connected');
            console.log('   Tables:', tables.map(t => Object.values(t)[0]).join(', '));

            // Check spas table structure
            const [columns] = await db.execute('DESCRIBE spas');
            const columnNames = columns.map(col => col.Field);

            const requiredColumns = ['blacklist_reason', 'blacklisted_at', 'payment_status'];
            const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

            if (missingColumns.length === 0) {
                console.log('✅ All required columns exist in spas table');
            } else {
                console.log('⚠️ Missing columns in spas table:', missingColumns);
            }

        } catch (error) {
            console.log('❌ Database error:', error.message);
        }

        // Test 4: Test sample data
        console.log('\n4️⃣ Checking sample data...');
        try {
            const db = require('../config/database');
            const [spas] = await db.execute('SELECT COUNT(*) as count FROM spas');
            console.log(`✅ Spas table has ${spas[0].count} records`);

            if (spas[0].count > 0) {
                const [sampleSpas] = await db.execute('SELECT id, name, status, payment_status, blacklist_reason FROM spas LIMIT 3');
                console.log('   Sample spa data:');
                sampleSpas.forEach(spa => {
                    console.log(`   - ${spa.name}: ${spa.status} (Payment: ${spa.payment_status || 'N/A'})`);
                });
            }
        } catch (error) {
            console.log('⚠️ Sample data error:', error.message);
        }

    } catch (error) {
        console.log('❌ General error:', error.message);
    }

    console.log('\n🏁 Test completed!\n');
}

// Run the test
if (require.main === module) {
    testManageSpasAPI();
}

module.exports = testManageSpasAPI;
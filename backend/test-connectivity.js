// Simple connectivity test
const fetch = require('node-fetch');

async function testConnection() {
    try {
        console.log('🔍 Testing server connectivity...');

        // Test basic connectivity
        const response = await fetch('http://localhost:5000/api/admin-spa-new/dashboard-stats');
        console.log('📊 Response status:', response.status);

        const result = await response.json();
        console.log('📋 Response:', JSON.stringify(result, null, 2));

        console.log('✅ Server is running and reachable!');

    } catch (error) {
        console.error('💥 Connection error:', error.message);
    }
}

testConnection();
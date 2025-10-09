// Quick test to verify backend API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPIs() {
    console.log('🧪 Testing Backend API Endpoints...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const health = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health check:', health.data.status);

        // Test dashboard stats
        console.log('\n2. Testing dashboard stats...');
        const stats = await axios.get(`${BASE_URL}/api/admin-spa-new/dashboard-stats`);
        console.log('✅ Dashboard stats:', stats.data);

        // Test recent activity
        console.log('\n3. Testing recent activity...');
        const activity = await axios.get(`${BASE_URL}/api/admin-spa-new/recent-activity`);
        console.log('✅ Recent activity:', Array.isArray(activity.data) ? `${activity.data.length} items` : 'No data');

        // Test notification history
        console.log('\n4. Testing notification history...');
        const history = await axios.get(`${BASE_URL}/api/admin-spa-new/notification-history`);
        console.log('✅ Notification history:', Array.isArray(history.data) ? `${history.data.length} items` : 'No data');

        console.log('\n🎉 All API tests passed!');

    } catch (error) {
        console.error('\n❌ API Test failed:');
        console.error('URL:', error.config?.url);
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
    }
}

testAPIs();
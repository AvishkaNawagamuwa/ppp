// Test notification history endpoint specifically
const axios = require('axios');

async function testNotificationHistory() {
    try {
        console.log('Testing notification history endpoint...\n');

        const response = await axios.get('http://localhost:5000/api/admin-spa-new/notification-history');

        console.log('Response status:', response.status);
        console.log('Response data type:', typeof response.data);
        console.log('Is array:', Array.isArray(response.data));
        console.log('Response data:', JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data)) {
            console.log(`\n✅ Response is array with ${response.data.length} items`);
            response.data.forEach((item, index) => {
                console.log(`Item ${index}:`, {
                    name: item.name,
                    status: item.status,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                });
            });
        } else {
            console.log('❌ Response is not an array');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testNotificationHistory();
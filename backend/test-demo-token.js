const axios = require('axios');

async function testDemoTokenAPI() {
    try {
        console.log('🧪 Testing Demo Token with Real Database...\n');

        // Test with demo token (now accepted by backend)
        console.log('Testing /api/third-party/user-info...');
        try {
            const userResponse = await axios.get('http://localhost:3001/api/third-party/user-info', {
                headers: { Authorization: 'Bearer demo-token-for-testing' }
            });
            console.log('✅ User info SUCCESS:', userResponse.data);
        } catch (error) {
            console.log('❌ User info failed:', error.response?.status, error.response?.data || error.message);
        }

        console.log('\nTesting /api/third-party/therapists/search...');
        try {
            const therapistsResponse = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
                headers: { Authorization: 'Bearer demo-token-for-testing' }
            });
            console.log('✅ Therapists SUCCESS!');
            console.log('📊 Total therapists:', therapistsResponse.data.data?.totalCount);
            console.log('📋 First therapist:', therapistsResponse.data.data?.therapists?.[0]?.name);
            console.log('📋 Second therapist:', therapistsResponse.data.data?.therapists?.[1]?.name);
        } catch (error) {
            console.log('❌ Therapists failed:', error.response?.status, error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testDemoTokenAPI();
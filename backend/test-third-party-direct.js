const axios = require('axios');

async function testThirdPartyAPI() {
    try {
        console.log('🧪 Testing Third-Party API Authentication...\n');

        // Test 1: Check if endpoints are accessible without auth (should fail)
        console.log('1. Testing endpoint without authentication...');
        try {
            const noAuthResponse = await axios.get('http://localhost:3001/api/third-party/therapists/search');
            console.log('❌ Unexpected: Got response without auth');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Correctly requires authentication (401)');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        // Test 2: Test with demo token
        console.log('\n2. Testing with demo token...');
        try {
            const demoResponse = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
                headers: { Authorization: 'Bearer demo-token-for-testing' }
            });
            console.log('✅ Demo token works!');
            console.log('📊 Therapists found:', demoResponse.data.data?.therapists?.length || 0);

            if (demoResponse.data.data?.therapists?.length > 0) {
                console.log('📋 Sample therapist data:');
                const sample = demoResponse.data.data.therapists[0];
                console.log('  - ID:', sample.id);
                console.log('  - Name:', sample.name);
                console.log('  - NIC:', sample.nicNumber);
                console.log('  - Phone:', sample.phone);
                console.log('  - Specialization:', sample.specialization);
                console.log('  - Status:', sample.status);
            }
        } catch (error) {
            console.log('❌ Demo token failed:', error.response?.data || error.message);
        }

        // Test 3: Test user info endpoint
        console.log('\n3. Testing user info endpoint...');
        try {
            const userResponse = await axios.get('http://localhost:3001/api/third-party/user-info', {
                headers: { Authorization: 'Bearer demo-token-for-testing' }
            });
            console.log('✅ User info endpoint works!');
            console.log('👤 User:', userResponse.data.data);
        } catch (error) {
            console.log('❌ User info failed:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testThirdPartyAPI();
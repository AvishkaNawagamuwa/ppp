const axios = require('axios');

async function testCurrentAPI() {
    try {
        console.log('🧪 Testing Current API Setup...\n');

        // Test user info endpoint
        console.log('1. Testing /api/third-party/user-info...');
        try {
            const userResponse = await axios.get('http://localhost:3001/api/third-party/user-info', {
                headers: { Authorization: 'Bearer demo-token-for-testing' }
            });
            console.log('✅ User info SUCCESS!');
            console.log('   Response:', userResponse.data);
        } catch (error) {
            console.log('❌ User info failed:', error.response?.status, error.response?.data?.error || error.message);
        }

        // Test therapists search endpoint
        console.log('\n2. Testing /api/third-party/therapists/search...');
        try {
            const therapistsResponse = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
                headers: { Authorization: 'Bearer demo-token-for-testing' }
            });
            console.log('✅ Therapists search SUCCESS!');
            console.log('   Total count:', therapistsResponse.data.data?.totalCount);
            console.log('   Therapists returned:', therapistsResponse.data.data?.therapists?.length);

            if (therapistsResponse.data.data?.therapists?.length > 0) {
                console.log('\n   📋 First few therapists:');
                therapistsResponse.data.data.therapists.slice(0, 3).forEach((therapist, index) => {
                    console.log(`   ${index + 1}. ${therapist.name} (${therapist.nicNumber}) - ${therapist.status}`);
                });
            }
        } catch (error) {
            console.log('❌ Therapists search failed:', error.response?.status, error.response?.data?.error || error.message);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testCurrentAPI();
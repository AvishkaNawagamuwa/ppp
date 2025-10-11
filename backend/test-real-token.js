const axios = require('axios');

// The real token from the previous step
const realToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsInVzZXJuYW1lIjoidGVzdF9vZmZpY2VyXzE3NjAxMTQyMDU1NTYiLCJyb2xlIjoiZ292ZXJubWVudF9vZmZpY2VyIiwiaWF0IjoxNzYwMTE0MjA1LCJleHAiOjE3NjAyMDA2MDV9.WqiTNZkgpc1S5EYcJgc9-maJxH1iOMeW8HFmveaLZ64';

async function testRealTokenAPI() {
    try {
        console.log('🧪 Testing Real Token API Calls...\n');

        // Test 1: Basic server health
        console.log('1. Testing server health...');
        try {
            const healthResponse = await axios.get('http://localhost:3001/api/auth/test');
            console.log('✅ Server is running:', healthResponse.status);
        } catch (error) {
            console.log('❌ Server health failed:', error.message);
        }

        // Test 2: User info with real token
        console.log('\n2. Testing user info endpoint...');
        try {
            const userResponse = await axios.get('http://localhost:3001/api/third-party/user-info', {
                headers: {
                    Authorization: `Bearer ${realToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ User info SUCCESS!');
            console.log('👤 User Data:', JSON.stringify(userResponse.data, null, 2));
        } catch (error) {
            console.log('❌ User info failed:');
            console.log('   Status:', error.response?.status);
            console.log('   Error:', error.response?.data || error.message);
        }

        // Test 3: Therapists search with real token  
        console.log('\n3. Testing therapists search endpoint...');
        try {
            const therapistsResponse = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
                headers: {
                    Authorization: `Bearer ${realToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Therapists search SUCCESS!');
            console.log('📊 Response structure:', {
                success: therapistsResponse.data.success,
                totalCount: therapistsResponse.data.data?.totalCount,
                therapistsLength: therapistsResponse.data.data?.therapists?.length
            });

            if (therapistsResponse.data.data?.therapists?.length > 0) {
                console.log('\n📋 Real Therapist Data (First 2):');
                therapistsResponse.data.data.therapists.slice(0, 2).forEach((therapist, index) => {
                    console.log(`\n   Therapist ${index + 1}:`);
                    console.log(`   - ID: ${therapist.id}`);
                    console.log(`   - Name: ${therapist.name}`);
                    console.log(`   - NIC: ${therapist.nicNumber}`);
                    console.log(`   - Phone: ${therapist.phone}`);
                    console.log(`   - Specialization: ${therapist.specialization}`);
                    console.log(`   - Status: ${therapist.status}`);
                    console.log(`   - Spa: ${therapist.spaName}`);
                });
            }
        } catch (error) {
            console.log('❌ Therapists search failed:');
            console.log('   Status:', error.response?.status);
            console.log('   Error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ General test error:', error.message);
    }
}

testRealTokenAPI();
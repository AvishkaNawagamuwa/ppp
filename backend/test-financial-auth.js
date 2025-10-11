const axios = require('axios');

async function testAuthentication() {
    try {
        console.log('🔐 Testing AdminLSA authentication...');

        // Test login
        const loginResponse = await axios.post('http://localhost:3001/api/auth/admin-lsa', {
            username: 'admin_lsa',
            password: 'admin123'
        });

        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            console.log('✅ Login successful! Token received:', token.substring(0, 20) + '...');

            // Test financial API with token
            console.log('\n📊 Testing financial API with auth token...');
            const financialResponse = await axios.get('http://localhost:3001/api/lsa/enhanced/financial/monthly?year=2025', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (financialResponse.data.success) {
                console.log('✅ Financial API works! Data received:', JSON.stringify(financialResponse.data, null, 2));
            } else {
                console.log('❌ Financial API failed:', financialResponse.data);
            }
        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }

    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.error('Full error:', error);
    }
}

testAuthentication();
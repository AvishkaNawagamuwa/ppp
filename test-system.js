const axios = require('axios');

async function testLoginAPI() {
    try {
        console.log('🔍 Testing login API with demo user...');

        const response = await axios.post('http://localhost:3001/api/third-party/login', {
            username: 'demo',
            password: 'demo123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        console.log('✅ API Response Success:');
        console.log('  Status:', response.status);
        console.log('  Token:', response.data.token ? 'Generated ✓' : 'Missing ✗');
        console.log('  User:', response.data.user.fullName);
        console.log('  Role:', response.data.user.role);
        console.log('  Username:', response.data.user.username);

        return true;

    } catch (error) {
        console.log('❌ API Test Failed:');
        if (error.code === 'ECONNREFUSED') {
            console.log('  Error: Cannot connect to server at http://localhost:3001');
            console.log('  Make sure the backend server is running');
        } else if (error.response) {
            console.log('  Status:', error.response.status);
            console.log('  Error:', error.response.data.error || 'Unknown error');
        } else {
            console.log('  Error:', error.message);
        }
        return false;
    }
}

async function testServers() {
    console.log('🚀 Testing Third Party Login System');
    console.log('=====================================\n');

    const apiWorking = await testLoginAPI();

    console.log('\n📋 Summary:');
    console.log('  Backend API:', apiWorking ? '✅ Working' : '❌ Not Working');
    console.log('  Frontend:', 'http://localhost:5173 (should be running)');
    console.log('  Login URL:', 'http://localhost:5173/third-party-login');
    console.log('  Dashboard URL:', 'http://localhost:5173/third-party-dashboard');

    if (apiWorking) {
        console.log('\n🎉 System Ready! You can now test the login:');
        console.log('  1. Go to: http://localhost:5173/third-party-login');
        console.log('  2. Username: demo');
        console.log('  3. Password: demo123');
        console.log('  4. Should redirect to: http://localhost:5173/third-party-dashboard');
    } else {
        console.log('\n⚠️  Backend API not responding. The frontend will use demo mode.');
    }
}

testServers();
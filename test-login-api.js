const axios = require('axios');

async function testThirdPartyLogin() {
    console.log('🔍 Testing Third Party Login API...');

    const testUsers = [
        { username: 'testuser', password: 'test123' },
        { username: 'gov_officer1', password: 'password123' },
        { username: 'kamal', password: 'wrongpassword' }, // This should fail
        { username: 'nonexistent', password: 'test123' }  // This should fail
    ];

    for (const user of testUsers) {
        try {
            console.log(`\n📝 Testing: ${user.username}`);

            const response = await axios.post('http://localhost:3001/api/third-party/login', {
                username: user.username,
                password: user.password
            });

            console.log('✅ SUCCESS: Login successful');
            console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
            console.log(`   User: ${response.data.user.fullName}`);
            console.log(`   Role: ${response.data.user.role}`);

        } catch (error) {
            console.log(`❌ FAILED: ${user.username}`);
            console.log(`   Error: ${error.response?.data?.error || error.message}`);
        }
    }
}

testThirdPartyLogin().catch(console.error);
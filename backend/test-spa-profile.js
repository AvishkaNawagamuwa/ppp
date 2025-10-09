const fetch = require('node-fetch');

async function testSpaProfile() {
    try {
        console.log('Testing SPA Profile API...');
        const response = await fetch('http://localhost:5000/api/admin-spa-new/spa-profile/1');
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

testSpaProfile();
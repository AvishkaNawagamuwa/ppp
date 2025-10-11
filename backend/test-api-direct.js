// Direct API Test
const axios = require('axios');

const testThirdPartyAPI = async () => {
    try {
        console.log('🧪 Direct Third Party API Test');
        console.log('URL: http://localhost:3001/api/third-party/therapists/search');
        console.log('Token: demo-token-for-testing');
        console.log('Method: GET');
        console.log('---');

        const response = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
            headers: {
                'Authorization': 'Bearer demo-token-for-testing',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data Keys:', Object.keys(response.data));

        if (response.data.success && response.data.data) {
            console.log('📊 Therapists found:', response.data.data.therapists ? response.data.data.therapists.length : 0);
            console.log('📄 Pagination:', response.data.data.pagination);

            if (response.data.data.therapists && response.data.data.therapists.length > 0) {
                console.log('👨‍⚕️ First therapist sample:');
                console.log('  ID:', response.data.data.therapists[0].id);
                console.log('  Name:', response.data.data.therapists[0].name);
                console.log('  NIC:', response.data.data.therapists[0].nic);
                console.log('  Specialty:', response.data.data.therapists[0].specialty);
                console.log('  Status:', response.data.data.therapists[0].status);
                console.log('  SPA:', response.data.data.therapists[0].spa_name);
            }
        }

    } catch (error) {
        console.error('❌ ERROR DETAILS:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', error.response?.data);
        console.error('Message:', error.message);
        console.error('Code:', error.code);
    }
};

testThirdPartyAPI();
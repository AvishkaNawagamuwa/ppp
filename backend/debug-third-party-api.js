// Debug API Test
const axios = require('axios');

const debugAPI = async () => {
    try {
        console.log('🔍 Testing Third Party API Debug...');
        console.log('URL: http://localhost:3001/api/third-party/therapists/search?query=John&page=1&limit=10');
        console.log('Token: demo-token-for-testing');

        const response = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
            params: {
                query: 'John',
                page: 1,
                limit: 10
            },
            headers: {
                'Authorization': 'Bearer demo-token-for-testing',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Success! Status:', response.status);
        console.log('✅ Headers:', response.headers);
        console.log('✅ Data:', JSON.stringify(response.data, null, 2));

        if (response.data.therapists) {
            console.log(`\n📊 Found ${response.data.therapists.length} therapists`);
            if (response.data.therapists.length > 0) {
                console.log('First therapist sample:', response.data.therapists[0]);
            }
        }

    } catch (error) {
        console.error('❌ Error Details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);

        if (error.response?.data) {
            console.error('\n🚨 Server Error Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

debugAPI();
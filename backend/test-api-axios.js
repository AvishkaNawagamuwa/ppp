// Simple API test using axios
const axios = require('axios');

async function testTherapistAPI() {
    console.log('🧪 Testing Therapist Admin API with axios...');

    try {
        const response = await axios.get('http://localhost:5000/api/therapists/admin/all', {
            timeout: 10000
        });

        console.log('✅ Status:', response.status);
        console.log('📊 Data received:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.data && response.data.data.therapists) {
            console.log('📋 Therapists count:', response.data.data.therapists.length);
            if (response.data.data.therapists.length > 0) {
                console.log('👤 First therapist:', JSON.stringify(response.data.data.therapists[0], null, 2));
            }
        }

    } catch (error) {
        console.error('🚨 API Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Request error:', error.message);
        }
    }
}

testTherapistAPI();
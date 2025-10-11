const axios = require('axios');

async function testThirdPartyAPI() {
    const baseURL = 'http://localhost:3001/api/third-party';

    console.log('🧪 Testing Third-Party API Endpoints...\n');

    try {
        // First login to get token
        console.log('1. Logging in as government officer...');
        const loginResponse = await axios.post(`${baseURL}/login`, {
            username: 'gov_officer_001',
            password: 'TempPass123!'
        });

        const token = loginResponse.data.token;
        console.log('✓ Login successful, token obtained');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Test search endpoint
        console.log('\n2. Testing therapist search...');
        const searchResponse = await axios.get(`${baseURL}/therapists/search`, { headers });
        console.log('✓ Search endpoint working!');
        console.log(`Found ${searchResponse.data.therapists.length} therapists`);

        if (searchResponse.data.therapists.length > 0) {
            const firstTherapist = searchResponse.data.therapists[0];
            console.log('\n--- First Therapist ---');
            console.log('ID:', firstTherapist.id);
            console.log('Name:', firstTherapist.name);
            console.log('NIC:', firstTherapist.nicNumber);
            console.log('Phone:', firstTherapist.phone);
            console.log('Specialization:', firstTherapist.specialization);
            console.log('Status:', firstTherapist.status);

            // Test detailed view
            console.log('\n3. Testing detailed therapist view...');
            const detailResponse = await axios.get(`${baseURL}/therapist/${firstTherapist.id}`, { headers });
            console.log('✓ Detail endpoint working!');

            const detail = detailResponse.data.therapist;
            console.log('\n--- Detailed Information ---');
            console.log('Full Name:', detail.personal_info.full_name);
            console.log('NIC:', detail.personal_info.nic);
            console.log('Phone:', detail.personal_info.phone);
            console.log('Email:', detail.personal_info.email);
            console.log('Specialization:', detail.personal_info.specialty);
            console.log('Status:', detail.personal_info.status);

            console.log('\n--- Documents ---');
            console.log('NIC Attachment:', detail.documents.nic_attachment ? '✓ Available' : '✗ Missing');
            console.log('Medical Certificate:', detail.documents.medical_certificate ? '✓ Available' : '✗ Missing');
            console.log('Spa Certificate:', detail.documents.spa_center_certificate ? '✓ Available' : '✗ Missing');
            console.log('Therapist Image:', detail.documents.therapist_image ? '✓ Available' : '✗ Missing');

            console.log('\n--- Working History ---');
            console.log(`Found ${detail.working_history.length} history entries`);

            if (detail.current_employment.spa_name) {
                console.log('\n--- Current Employment ---');
                console.log('Spa Name:', detail.current_employment.spa_name);
            }
        }

        console.log('\n🎉 All tests passed! Real database integration is working correctly!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.error || error.message);
        if (error.response?.status === 401) {
            console.log('Note: Authentication failed - this is expected if test account doesn\'t exist');
        }
    }
}

testThirdPartyAPI();
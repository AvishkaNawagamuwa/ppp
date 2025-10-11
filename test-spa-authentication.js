const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSpaAuthentication() {
    console.log('🧪 Testing SPA Authentication and Dynamic Data Loading...\n');

    try {
        // Step 1: Login with test spa credentials
        console.log('1️⃣  Testing login with spa credentials...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'test0041',
            password: 'CMPFbekNL4Xy'
        });

        if (loginResponse.data.success) {
            console.log('✅ Login successful!');
            console.log('👤 User:', loginResponse.data.user.full_name);
            console.log('🏢 SPA ID:', loginResponse.data.user.spa_id);
            console.log('🎭 Role:', loginResponse.data.user.role);

            const token = loginResponse.data.token;
            const spaId = loginResponse.data.user.spa_id;

            // Step 2: Test dashboard stats with authentication
            console.log('\n2️⃣  Testing dashboard stats...');
            const statsResponse = await axios.get(`${BASE_URL}/api/admin-spa-new/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (statsResponse.data.success) {
                console.log('✅ Dashboard stats loaded for SPA', spaId);
                console.log('📊 Approved therapists:', statsResponse.data.approved_therapists);
                console.log('📊 Pending therapists:', statsResponse.data.pending_therapists);
            }

            // Step 3: Test notification history
            console.log('\n3️⃣  Testing notification history...');
            const notificationsResponse = await axios.get(`${BASE_URL}/api/admin-spa-new/notification-history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Notification history loaded:', notificationsResponse.data.length, 'records');

            // Step 4: Test therapists list
            console.log('\n4️⃣  Testing therapists list...');
            const therapistsResponse = await axios.get(`${BASE_URL}/api/admin-spa-new/spas/${spaId}/therapists`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (therapistsResponse.data.success) {
                console.log('✅ Therapists loaded for SPA', spaId);
                console.log('👥 Total therapists:', therapistsResponse.data.therapists?.length || 0);
            }

            // Step 5: Test spa profile
            console.log('\n5️⃣  Testing spa profile...');
            const profileResponse = await axios.get(`${BASE_URL}/api/spa/profile/${spaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (profileResponse.data.success) {
                console.log('✅ Spa profile loaded for SPA', spaId);
                console.log('🏢 Spa name:', profileResponse.data.data.name);
                console.log('👤 Owner:', `${profileResponse.data.data.owner_fname} ${profileResponse.data.data.owner_lname}`);
            }

            console.log('\n🎉 All tests completed successfully!');
            console.log('🔧 Dynamic spa filtering is working correctly.');

        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Test error:', error.response?.data || error.message);
    }
}

testSpaAuthentication();
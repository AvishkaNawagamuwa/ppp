/**
 * Test Script for Resign/Terminate Therapist Functionality
 * Tests the API endpoints for updating therapist status
 */

const { fetch } = require('undici');

const BASE_URL = 'http://localhost:5000';
const TEST_SPA_ID = '1';

async function testResignTerminateAPI() {
    console.log('🧪 Testing Resign/Terminate Therapist API\n');

    try {
        // Test 1: Get approved therapists first
        console.log('📋 Test 1: Fetching approved therapists...');
        const approvedResponse = await fetch(`${BASE_URL}/api/admin-spa-new/spas/${TEST_SPA_ID}/therapists?status=approved`);
        const approvedData = await approvedResponse.json();

        if (!approvedData.success) {
            console.log('❌ Failed to fetch approved therapists:', approvedData.error);
            return;
        }

        const approvedTherapists = approvedData.therapists || [];
        console.log(`✅ Found ${approvedTherapists.length} approved therapists`);

        if (approvedTherapists.length === 0) {
            console.log('⚠️  No approved therapists found to test with');
            return;
        }

        // Show sample therapist
        const sampleTherapist = approvedTherapists[0];
        console.log(`   Sample: ${sampleTherapist.first_name} ${sampleTherapist.last_name} (ID: ${sampleTherapist.therapist_id})`);

        // Test 2: Test resignation API (without actually doing it)
        console.log('\n📋 Test 2: Testing resignation API validation...');
        try {
            const resignResponse = await fetch(`${BASE_URL}/api/admin-spa-new/therapists/999999/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'resigned',
                    reason: 'Test resignation',
                    spa_id: TEST_SPA_ID
                })
            });

            const resignData = await resignResponse.json();

            if (resignResponse.status === 404) {
                console.log('✅ Resignation API correctly validates therapist existence');
            } else {
                console.log('⚠️  Unexpected response for non-existent therapist:', resignData);
            }
        } catch (error) {
            console.log('❌ Error testing resignation API:', error.message);
        }

        // Test 3: Test termination API validation
        console.log('\n📋 Test 3: Testing termination API validation...');
        try {
            // Test without reason (should fail)
            const terminateResponse = await fetch(`${BASE_URL}/api/admin-spa-new/therapists/${sampleTherapist.therapist_id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'terminated',
                    spa_id: TEST_SPA_ID
                    // No reason provided - should fail
                })
            });

            const terminateData = await terminateResponse.json();

            if (!terminateData.success && terminateData.message.includes('reason')) {
                console.log('✅ Termination API correctly validates required reason');
            } else {
                console.log('⚠️  Termination validation may have issues:', terminateData);
            }
        } catch (error) {
            console.log('❌ Error testing termination API:', error.message);
        }

        // Test 4: Test invalid status
        console.log('\n📋 Test 4: Testing invalid status validation...');
        try {
            const invalidResponse = await fetch(`${BASE_URL}/api/admin-spa-new/therapists/${sampleTherapist.therapist_id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'invalid_status',
                    spa_id: TEST_SPA_ID
                })
            });

            const invalidData = await invalidResponse.json();

            if (!invalidData.success && invalidData.message.includes('Invalid status')) {
                console.log('✅ API correctly validates status values');
            } else {
                console.log('⚠️  Status validation may have issues:', invalidData);
            }
        } catch (error) {
            console.log('❌ Error testing invalid status:', error.message);
        }

        console.log('\n🎉 API validation tests completed!');
        console.log('\n💡 The Resign/Terminate functionality is ready for testing in the UI');
        console.log(`   Navigate to: http://localhost:5173/adminSPA (Manage Staff section)`);

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testResignTerminateAPI();
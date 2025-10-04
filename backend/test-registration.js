// Test the therapist registration endpoint
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testTherapistRegistration() {
    try {
        const formData = new FormData();
        formData.append('firstName', 'Test');
        formData.append('lastName', 'Therapist');
        formData.append('birthday', '1990-01-01');
        formData.append('nic', '901234567V');
        formData.append('phone', '+94771234573');
        formData.append('spa_id', '1');
        formData.append('email', 'test.therapist@spa.com');
        formData.append('address', 'Test Location');
        formData.append('experience_years', '2');
        formData.append('specializations', JSON.stringify(['Test Therapy']));

        console.log('🧪 Testing therapist registration...');

        const response = await fetch('http://localhost:5000/api/therapists/register', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        console.log('📊 Response status:', response.status);
        console.log('📋 Response data:', result);

        if (result.success) {
            console.log('✅ Test successful! Therapist registered with ID:', result.data.id);

            // Test notification creation
            const notificationResponse = await fetch('http://localhost:5000/api/lsa/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient_id: 1,
                    recipient_type: 'admin_lsa',
                    title: 'Test Therapist Registration',
                    message: `Test therapist "Test Therapist" has registered and is pending approval.`,
                    type: 'therapist_registration',
                    reference_id: result.data.id,
                    reference_type: 'therapist'
                })
            });

            const notificationResult = await notificationResponse.json();
            console.log('📧 Notification result:', notificationResult);

        } else {
            console.log('❌ Test failed:', result.message);
        }

    } catch (error) {
        console.error('🚨 Test error:', error.message);
    }
}

testTherapistRegistration();
// Test script to verify the add therapist functionality
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

// Test the new add-therapist endpoint
async function testAddTherapist() {
    try {
        console.log('🧪 Testing Add Therapist endpoint...');

        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('birthday', '1990-01-15');
        formData.append('nic', '901234567V');
        formData.append('phone', '+94771234567');
        formData.append('spa_id', '1');
        formData.append('name', 'John Doe');
        formData.append('email', 'john.doe@spa.com');
        formData.append('address', 'Test Address');
        formData.append('experience_years', '2');
        formData.append('specializations', JSON.stringify(['Swedish Massage', 'Aromatherapy']));

        console.log('📝 Test data prepared...');
        console.log('📡 Sending request to backend...');

        const response = await fetch('http://localhost:5000/api/admin-spa-new/add-therapist', {
            method: 'POST',
            body: formData
        });

        console.log('📊 Response status:', response.status);

        const result = await response.json();
        console.log('📋 Response data:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('✅ Test successful! Therapist ID:', result.therapist_id);
        } else {
            console.log('❌ Test failed:', result.message);
        }

    } catch (error) {
        console.error('💥 Test error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🔧 Backend server is not running. Please start it first with:');
            console.log('   cd backend && node server.js');
        }
    }
}

testAddTherapist();
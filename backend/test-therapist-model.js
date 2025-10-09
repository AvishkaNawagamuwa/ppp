// Direct test of TherapistModel to debug the issue
require('dotenv').config();
const TherapistModel = require('./models/TherapistModel');

async function testTherapistModel() {
    console.log('🧪 Testing TherapistModel directly...');

    try {
        console.log('📞 Calling TherapistModel.getAllTherapists()...');
        const result = await TherapistModel.getAllTherapists();

        console.log('✅ TherapistModel.getAllTherapists() result:');
        console.log('Type:', typeof result);
        console.log('Array?:', Array.isArray(result));
        console.log('Length:', result ? result.length : 'undefined');

        if (result && result.length > 0) {
            console.log('📊 First therapist:');
            console.log(JSON.stringify(result[0], null, 2));
        } else {
            console.log('❌ No therapists returned');
        }

        console.log('📋 Full result object:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('🚨 Error testing TherapistModel:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }

    process.exit(0);
}

testTherapistModel();
const TherapistModel = require('./models/TherapistModel');

async function testGetAllTherapists() {
    try {
        console.log('Testing getAllTherapists with pending status...');
        const result1 = await TherapistModel.getAllTherapists('pending');
        console.log('Pending therapists:', JSON.stringify(result1, null, 2));

        console.log('\nTesting getAllTherapists with no status filter...');
        const result2 = await TherapistModel.getAllTherapists();
        console.log('All therapists:', JSON.stringify(result2, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testGetAllTherapists();
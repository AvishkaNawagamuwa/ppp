const SpaModel = require('./models/SpaModel');

async function testGetAllSpas() {
    try {
        console.log('Testing getAllSpas with no filters...');
        const result1 = await SpaModel.getAllSpas({});
        console.log('Result:', JSON.stringify(result1, null, 2));

        console.log('\nTesting getAllSpas with default filters...');
        const result2 = await SpaModel.getAllSpas({ page: 1, limit: 10 });
        console.log('Result:', JSON.stringify(result2, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testGetAllSpas();
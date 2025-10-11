// Test the SpaModel directly to see what it returns
const SpaModel = require('./backend/models/SpaModel');

async function testSpaModel() {
    try {
        console.log('Testing SpaModel.getAllSpas directly...\n');

        const result = await SpaModel.getAllSpas({});

        if (result && result.spas) {
            console.log(`Found ${result.spas.length} spas\n`);

            // Find Sumith's record
            const sumith = result.spas.find(spa => spa.spa_id === 42 ||
                (spa.spa_name && spa.spa_name.toLowerCase().includes('sumith')));

            if (sumith) {
                console.log('=== SUMITH SPA FROM SPAMODEL ===');
                console.log('ID:', sumith.spa_id);
                console.log('Name:', sumith.spa_name);
                console.log('Owner:', sumith.owner_name);
                console.log('\nDocument fields from SpaModel:');
                console.log('- certificate_path:', sumith.certificate_path);
                console.log('- form1_certificate_path:', JSON.stringify(sumith.form1_certificate_path));
                console.log('- nic_front_path:', JSON.stringify(sumith.nic_front_path));
                console.log('- nic_back_path:', JSON.stringify(sumith.nic_back_path));
                console.log('- br_attachment_path:', JSON.stringify(sumith.br_attachment_path));
                console.log('- other_document_path:', JSON.stringify(sumith.other_document_path));
                console.log('- spa_banner_photos_path:', JSON.stringify(sumith.spa_banner_photos_path));

                console.log('\nAll available fields:');
                Object.keys(sumith).forEach(key => {
                    if (key.includes('path') || key.includes('document')) {
                        console.log(`- ${key}: ${JSON.stringify(sumith[key])}`);
                    }
                });
            } else {
                console.log('Sumith spa not found in SpaModel results');
                console.log('Available spas:', result.spas.map(s => `${s.spa_id}: ${s.spa_name}`).slice(0, 3));
            }
        } else {
            console.log('No spas returned from SpaModel');
        }

    } catch (error) {
        console.error('Error testing SpaModel:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSpaModel();
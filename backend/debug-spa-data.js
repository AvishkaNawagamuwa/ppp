// Debug script to check actual spa data structure
const axios = require('axios');

async function debugSpaData() {
    try {
        console.log('🔍 Fetching spa data from API...\n');

        const response = await axios.get('http://localhost:5000/api/lsa/spas');

        if (response.data.success) {
            const spas = response.data.data.spas;
            console.log(`✅ Found ${spas.length} spas\n`);

            if (spas.length > 0) {
                console.log('📋 First spa data structure:');
                console.log(JSON.stringify(spas[0], null, 2));

                console.log('\n🔑 Available field names:');
                Object.keys(spas[0]).forEach(key => {
                    console.log(`  - ${key}: ${typeof spas[0][key]} = ${spas[0][key]}`);
                });

                console.log('\n📊 Status distribution:');
                const statuses = {};
                spas.forEach(spa => {
                    statuses[spa.status] = (statuses[spa.status] || 0) + 1;
                });
                console.log(statuses);

                console.log('\n💳 Payment status distribution:');
                const paymentStatuses = {};
                spas.forEach(spa => {
                    paymentStatuses[spa.payment_status || 'undefined'] = (paymentStatuses[spa.payment_status || 'undefined'] || 0) + 1;
                });
                console.log(paymentStatuses);
            }
        } else {
            console.log('❌ API returned error:', response.data);
        }
    } catch (error) {
        console.error('❌ Error fetching data:', error.message);
    }
}

debugSpaData();
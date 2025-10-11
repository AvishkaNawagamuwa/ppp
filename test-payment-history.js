const http = require('http');

function testPaymentHistory() {
    console.log('🧪 Testing payment history API...');

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/lsa/enhanced/payments/history?limit=5',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log('✅ API Response Status:', res.statusCode);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📊 Response Data:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
                console.log('📊 Raw Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ API Test Failed:', error.message);
    });

    req.end();
}

testPaymentHistory();
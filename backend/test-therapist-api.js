const http = require('http');

function testAPI(path, name) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`\n=== ${name} ===`);
                console.log('Status Code:', res.statusCode);
                try {
                    const jsonData = JSON.parse(data);
                    console.log('Response:', JSON.stringify(jsonData, null, 2));
                } catch (e) {
                    console.log('Raw response:', data);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`Error testing ${name}:`, error.message);
            resolve(); // Don't reject to continue with other tests
        });

        req.end();
    });
}

async function runTests() {
    console.log('Testing Therapist API endpoints...');

    await testAPI('/api/health', 'Health Check');
    await testAPI('/api/therapists/admin/all', 'Get All Therapists');
    await testAPI('/api/therapists/admin/all?status=pending', 'Get Pending Therapists');

    console.log('\nTests completed.');
}

runTests();
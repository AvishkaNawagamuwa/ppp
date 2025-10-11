const http = require('http');

async function testThirdPartyLogin() {
    console.log('🧪 Testing Third-Party Login API...');

    const testCases = [
        { username: 'testuser', password: 'test123' },
        { username: 'gov_officer1', password: 'password123' },
        { username: 'invalid', password: 'wrong' }
    ];

    for (const testCase of testCases) {
        console.log(`\n📝 Testing: ${testCase.username} / ${testCase.password}`);

        const postData = JSON.stringify(testCase);

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/third-party/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        try {
            const result = await new Promise((resolve, reject) => {
                const req = http.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const jsonResponse = JSON.parse(data);
                            resolve({
                                status: res.statusCode,
                                data: jsonResponse
                            });
                        } catch (e) {
                            resolve({
                                status: res.statusCode,
                                data: data
                            });
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                req.write(postData);
                req.end();
            });

            console.log(`✅ Status: ${result.status}`);
            console.log('📄 Response:', JSON.stringify(result.data, null, 2));

        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }
}

testThirdPartyLogin();
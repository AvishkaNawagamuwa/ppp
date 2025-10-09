// Simple test to check if the server is working with our fixes
const https = require('https');
const http = require('http');

function testRegistrationEndpoint() {
    const data = JSON.stringify({
        test: "ping"
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/enhanced-registration/submit',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('Response Body:', body);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(data);
    req.end();
}

console.log('Testing registration endpoint...');
testRegistrationEndpoint();
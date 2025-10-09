const http = require('http');

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/therapists/admin/all',
    method: 'GET'
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Success:', json.success);
            console.log('Count:', json.data?.count || 0);
            if (json.data?.therapists?.length > 0) {
                console.log('First therapist:', {
                    name: json.data.therapists[0].full_name,
                    fname: json.data.therapists[0].fname,
                    lname: json.data.therapists[0].lname,
                    status: json.data.therapists[0].status,
                    spa: json.data.therapists[0].spa_name
                });
            }
        } catch (e) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', console.error);
req.end();
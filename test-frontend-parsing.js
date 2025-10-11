// Test the frontend JSON parsing logic
const testData = {
    spa_id: 42,
    spa_name: 'sumith nawagamuwa',
    form1_certificate_path: '["uploads\\\\spas\\\\form1\\\\form1Certificate-1760173923535-811789730.pdf"]',
    nic_front_path: '["uploads\\\\spas\\\\nic\\\\nicFront-1760173923473-209931025.jpg"]',
    nic_back_path: '["uploads\\\\spas\\\\nic\\\\nicBack-1760173923498-375879924.jpg"]'
};

const parseJsonField = (field) => {
    if (!field) return null;
    try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
        }
        return field;
    } catch (e) {
        return field;
    }
};

console.log('Frontend JSON Processing Test:');
console.log('Original form1_certificate_path:', testData.form1_certificate_path);
console.log('Parsed form1_certificate_path:', parseJsonField(testData.form1_certificate_path));
console.log('Parsed nic_front_path:', parseJsonField(testData.nic_front_path));
console.log('Parsed nic_back_path:', parseJsonField(testData.nic_back_path));

// Test processing like the frontend would
const processedSpa = {
    ...testData,
    form1_certificate_path: parseJsonField(testData.form1_certificate_path),
    nic_front_path: parseJsonField(testData.nic_front_path),
    nic_back_path: parseJsonField(testData.nic_back_path)
};

console.log('\nProcessed Spa Object:');
console.log('- Form1:', processedSpa.form1_certificate_path);
console.log('- NIC Front:', processedSpa.nic_front_path);
console.log('- NIC Back:', processedSpa.nic_back_path);
// Test the complete flow: API call + frontend processing for spa management
const axios = require('axios');

const parseJsonField = (field) => {
    if (!field) return null;
    try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0]; // Return first file path
        }
        return field; // Return as is if not JSON array
    } catch (e) {
        return field; // Return original value if not valid JSON
    }
};

async function testSpaManagementFlow() {
    try {
        console.log('Testing Spa Management Flow: API + Frontend Processing\n');

        // 1. Get data from API (simulating what frontend does)
        const response = await axios.get('http://localhost:3001/api/lsa/spas');

        if (response.data.success) {
            const rawSpas = response.data.data.spas || [];
            console.log(`Retrieved ${rawSpas.length} spas from API\n`);

            // 2. Process spa data (simulating frontend processing)
            const processedSpas = rawSpas.map(spa => ({
                ...spa,
                // Parse document paths from JSON arrays if they exist
                form1_certificate_path: parseJsonField(spa.form1_certificate_path),
                nic_front_path: parseJsonField(spa.nic_front_path),
                nic_back_path: parseJsonField(spa.nic_back_path),
                br_attachment_path: parseJsonField(spa.br_attachment_path),
                other_document_path: parseJsonField(spa.other_document_path),
                spa_banner_photos_path: parseJsonField(spa.spa_banner_photos_path)
            }));

            // 3. Find and display Sumith's record
            const sumithSpa = processedSpas.find(spa =>
                spa.spa_id === 42 ||
                (spa.spa_name && spa.spa_name.toLowerCase().includes('sumith'))
            );

            if (sumithSpa) {
                console.log('=== SUMITH NAWAGAMUWA SPA (After Processing) ===');
                console.log(`ID: ${sumithSpa.spa_id}`);
                console.log(`Name: ${sumithSpa.spa_name}`);
                console.log(`Owner: ${sumithSpa.owner_name}`);
                console.log(`Email: ${sumithSpa.email}`);
                console.log(`Status: ${sumithSpa.status}`);
                console.log(`Verification: ${sumithSpa.verification_status}`);

                console.log('\n--- DOCUMENT PATHS (Ready for UI Display) ---');
                console.log(`✓ Main Certificate: ${sumithSpa.certificate_path || 'No document uploaded'}`);
                console.log(`✓ Form 1 Certificate: ${sumithSpa.form1_certificate_path || 'No document uploaded'}`);
                console.log(`✓ NIC Front: ${sumithSpa.nic_front_path || 'No document uploaded'}`);
                console.log(`✓ NIC Back: ${sumithSpa.nic_back_path || 'No document uploaded'}`);
                console.log(`✓ Business Registration: ${sumithSpa.br_attachment_path || 'No document uploaded'}`);
                console.log(`✓ Other Documents: ${sumithSpa.other_document_path || 'No document uploaded'}`);
                console.log(`✓ Spa Banner Photos: ${sumithSpa.spa_banner_photos_path || 'No document uploaded'}`);

                console.log('\n--- UI READINESS CHECK ---');
                const hasDocuments = sumithSpa.form1_certificate_path || sumithSpa.nic_front_path ||
                    sumithSpa.nic_back_path || sumithSpa.br_attachment_path ||
                    sumithSpa.other_document_path || sumithSpa.spa_banner_photos_path;

                console.log(`Documents available for display: ${hasDocuments ? 'YES ✓' : 'NO ✗'}`);
                console.log(`View/Download buttons should be: ${hasDocuments ? 'ENABLED' : 'DISABLED'}`);

                if (hasDocuments) {
                    console.log('\n--- DOCUMENT URLS FOR VIEW/DOWNLOAD ---');
                    if (sumithSpa.form1_certificate_path) {
                        console.log(`Form 1 View: http://localhost:3001/api/lsa/spas/${sumithSpa.spa_id}/documents/form1_certificate?action=view`);
                        console.log(`Form 1 Download: http://localhost:3001/api/lsa/spas/${sumithSpa.spa_id}/documents/form1_certificate?action=download`);
                    }
                    if (sumithSpa.nic_front_path) {
                        console.log(`NIC Front View: http://localhost:3001/api/lsa/spas/${sumithSpa.spa_id}/documents/nic_front?action=view`);
                    }
                    if (sumithSpa.nic_back_path) {
                        console.log(`NIC Back View: http://localhost:3001/api/lsa/spas/${sumithSpa.spa_id}/documents/nic_back?action=view`);
                    }
                }
            } else {
                console.log('❌ Sumith Nawagamuwa spa not found in processed data');
                console.log('Available spas:', processedSpas.map(s => `${s.spa_id}: ${s.spa_name}`).slice(0, 5));
            }
        } else {
            console.log('❌ API request failed');
        }

    } catch (error) {
        console.error('❌ Error in spa management flow test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testSpaManagementFlow();
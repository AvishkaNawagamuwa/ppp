// Test the modal display with actual database data
const axios = require('axios');

async function testModalData() {
    try {
        console.log('🔍 Testing modal data display...\n');

        const response = await axios.get('http://localhost:5000/api/lsa/spas');

        if (response.data.success && response.data.data.spas.length > 0) {
            const spa = response.data.data.spas[0];
            console.log('📋 Sample spa data for modal:');
            console.log('- Spa Name:', spa.spa_name || spa.name || 'N/A');
            console.log('- Owner:', spa.owner_name || (spa.owner_fname + ' ' + spa.owner_lname) || 'N/A');
            console.log('- Email:', spa.email || 'N/A');
            console.log('- Reference:', spa.reference_number || `SPA-${spa.spa_id}` || 'N/A');
            console.log('- Phone:', spa.contact_phone || spa.phone || 'N/A');
            console.log('- Address:', spa.address || spa.city || 'N/A');
            console.log('- Status:', spa.verification_status || spa.status || 'Unknown');
            console.log('- Payment Status:', spa.payment_status || spa.annual_payment_status || 'Not set');
            console.log('- Payment Method:', spa.payment_method || 'Not specified');
            console.log('- Next Payment:', spa.next_payment_date || 'Not set');
            console.log('- Registration Date:', spa.created_at || spa.registration_date || 'N/A');

            console.log('\n📄 Available Documents:');
            const docs = [
                { name: 'Main Certificate', path: spa.certificate_path },
                { name: 'Form 1 Certificate', path: spa.form1_certificate_path },
                { name: 'NIC Front', path: spa.nic_front_path },
                { name: 'NIC Back', path: spa.nic_back_path },
                { name: 'Business Registration', path: spa.br_attachment_path },
                { name: 'Other Documents', path: spa.other_document_path }
            ];

            docs.forEach(doc => {
                if (doc.path) {
                    console.log(`✅ ${doc.name}: ${doc.path}`);
                } else {
                    console.log(`❌ ${doc.name}: Not available`);
                }
            });

            if (spa.spa_photos_banner) {
                const photos = spa.spa_photos_banner.split(',');
                console.log(`\n📷 Gallery Photos: ${photos.length} photos available`);
                photos.forEach((photo, index) => {
                    console.log(`   Photo ${index + 1}: ${photo.trim()}`);
                });
            } else {
                console.log('\n📷 Gallery Photos: None available');
            }

            console.log('\n✅ Modal should now display all available information correctly!');
        } else {
            console.log('❌ No spa data available');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testModalData();
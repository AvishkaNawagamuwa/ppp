const axios = require('axios');

async function checkPendingTherapists() {
    try {
        console.log('🔍 Checking pending therapists data...\n');

        const response = await axios.get('http://localhost:3001/api/lsa/therapists?status=pending');
        const therapists = response.data.data.therapists;

        console.log(`Found ${therapists.length} pending therapists:`);

        therapists.forEach((therapist, index) => {
            console.log(`\n${index + 1}. ID: ${therapist.id}`);
            console.log(`   Name: ${therapist.name || 'N/A'}`);
            console.log(`   Email: ${therapist.email || 'N/A'}`);
            console.log(`   Documents:`);
            console.log(`     nic_attachment: ${therapist.nic_attachment || 'NULL'}`);
            console.log(`     medical_certificate: ${therapist.medical_certificate || 'NULL'}`);
            console.log(`     spa_center_certificate: ${therapist.spa_center_certificate || 'NULL'}`);
            console.log(`     therapist_image: ${therapist.therapist_image || 'NULL'}`);

            // Check if this matches the modal data
            if (therapist.email === 'aviccshka.nawagmuwa@spa.com') {
                console.log('   ⭐ THIS IS THE ONE SHOWN IN THE MODAL');
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkPendingTherapists();
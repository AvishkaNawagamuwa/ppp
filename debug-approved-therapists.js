const axios = require('axios');

async function checkApprovedTherapists() {
    try {
        console.log('🔍 Checking approved therapists data...\n');

        const response = await axios.get('http://localhost:3001/api/lsa/therapists?status=approved');
        const therapists = response.data.data.therapists;

        console.log(`Found ${therapists.length} approved therapists:`);

        therapists.forEach((therapist, index) => {
            console.log(`\n${index + 1}. ID: ${therapist.id}`);
            console.log(`   Name: ${therapist.name || 'N/A'}`);
            console.log(`   Email: ${therapist.email || 'N/A'}`);

            const hasNic = !!therapist.nic_attachment;
            const hasMedical = !!therapist.medical_certificate;
            const hasSpa = !!therapist.spa_center_certificate;
            const hasImage = !!therapist.therapist_image;

            console.log(`   Documents: NIC:${hasNic ? 'YES' : 'NO'} | Medical:${hasMedical ? 'YES' : 'NO'} | SPA:${hasSpa ? 'YES' : 'NO'} | Image:${hasImage ? 'YES' : 'NO'}`);

            if (hasNic || hasMedical || hasSpa || hasImage) {
                console.log('   ⭐ HAS DOCUMENTS - Test this one!');
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkApprovedTherapists();
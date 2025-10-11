const axios = require('axios');

async function checkAllTherapistsByStatus() {
    try {
        console.log('🔍 Checking therapists with documents by status...\n');

        const statuses = ['pending', 'approved', 'rejected', 'resigned', 'terminated'];

        for (const status of statuses) {
            const response = await axios.get(`http://localhost:3001/api/lsa/therapists?status=${status}`);
            const therapists = response.data.data.therapists;

            const withDocs = therapists.filter(t =>
                t.nic_attachment || t.medical_certificate ||
                t.spa_center_certificate || t.therapist_image
            );

            console.log(`📊 ${status.toUpperCase()}: ${therapists.length} total, ${withDocs.length} with documents`);

            if (withDocs.length > 0) {
                console.log('   Therapists with docs:');
                withDocs.forEach(t => {
                    console.log(`     - ID:${t.id}, Name:${t.name}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAllTherapistsByStatus();
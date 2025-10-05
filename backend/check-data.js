const db = require('./config/database');

async function checkSpaData() {
    try {
        const [spas] = await db.execute('SELECT * FROM spas LIMIT 5');
        console.log('Spa data:');
        spas.forEach(spa => {
            console.log(`ID: ${spa.id}, Name: ${spa.name}, Status: ${spa.status}, Verification: ${spa.verification_status}`);
        });

        const [therapists] = await db.execute('SELECT * FROM therapists LIMIT 5');
        console.log('\nTherapist data:');
        therapists.forEach(therapist => {
            console.log(`ID: ${therapist.id}, Name: ${therapist.name}, Status: ${therapist.status}, SPA ID: ${therapist.spa_id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSpaData();
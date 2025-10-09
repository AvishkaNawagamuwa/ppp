const db = require('./config/database');

async function addTestData() {
    try {
        console.log('Adding test notification history data...\n');

        // Add some rejected therapists for better testing
        const testTherapists = [
            {
                spa_id: 1,
                name: 'Saman Perera',
                nic: '123456789V',
                status: 'rejected',
                reject_reason: 'Incomplete documentation'
            },
            {
                spa_id: 1,
                name: 'Nimal Silva',
                nic: '987654321V',
                status: 'rejected',
                reject_reason: 'Medical certificate expired'
            },
            {
                spa_id: 1,
                name: 'Kasuni Fernando',
                nic: '456789123V',
                status: 'approved',
                reject_reason: null
            }
        ];

        for (const therapist of testTherapists) {
            await db.execute(`
                INSERT INTO therapists (spa_id, name, nic, email, phone, address, status, reject_reason, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                therapist.spa_id,
                therapist.name,
                therapist.nic,
                `${therapist.name.replace(' ', '').toLowerCase()}@example.com`,
                '0771234567',
                'Colombo, Sri Lanka',
                therapist.status,
                therapist.reject_reason
            ]);

            console.log(`✅ Added ${therapist.status} therapist: ${therapist.name}`);
        }

        console.log('\n🎉 Test data added successfully!');

        // Verify the data
        const [results] = await db.execute(`
            SELECT name, status, created_at 
            FROM therapists 
            WHERE spa_id = 1 AND status IN ('approved', 'rejected')
            ORDER BY created_at DESC
        `);

        console.log('\n📊 Current notification history:');
        results.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name} - ${row.status} (${row.created_at})`);
        });

    } catch (error) {
        console.error('Error adding test data:', error.message);
    }
    process.exit();
}

addTestData();
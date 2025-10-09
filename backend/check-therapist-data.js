const mysql = require('mysql2/promise');

async function checkAndAddTestData() {
    try {
        // Database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('Connected to database...');

        // Check if there are any therapists
        const [therapists] = await connection.execute('SELECT * FROM therapists');
        console.log(`Found ${therapists.length} therapists in database`);

        if (therapists.length === 0) {
            console.log('No therapists found. Adding test data...');

            // Check if there are any spas
            const [spas] = await connection.execute('SELECT * FROM spas LIMIT 1');
            let spaId = 1;

            if (spas.length === 0) {
                // Create a test spa first
                const [spaResult] = await connection.execute(`
                    INSERT INTO spas (name, spa_br_number, spa_tel, owner_fname, owner_lname, owner_email, owner_nic, address_line1, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    'Test Spa Center',
                    'BR001',
                    '0771234567',
                    'John',
                    'Doe',
                    'john@testspa.com',
                    '123456789V',
                    '123 Test Street',
                    'verified'
                ]);
                spaId = spaResult.insertId;
                console.log(`Created test spa with ID: ${spaId}`);
            } else {
                spaId = spas[0].id;
                console.log(`Using existing spa with ID: ${spaId}`);
            }

            // Add test therapists
            const testTherapists = [
                {
                    fname: 'Alice',
                    lname: 'Johnson',
                    nic: '987654321V',
                    telno: '0771111111',
                    email: 'alice@testspa.com',
                    specialty: 'Swedish Massage',
                    status: 'pending'
                },
                {
                    fname: 'Bob',
                    lname: 'Smith',
                    nic: '876543210V',
                    telno: '0772222222',
                    email: 'bob@testspa.com',
                    specialty: 'Deep Tissue Massage',
                    status: 'approved'
                },
                {
                    fname: 'Carol',
                    lname: 'Williams',
                    nic: '765432109V',
                    telno: '0773333333',
                    email: 'carol@testspa.com',
                    specialty: 'Aromatherapy',
                    status: 'rejected',
                    rejection_reason: 'Insufficient experience'
                }
            ];

            for (const therapist of testTherapists) {
                await connection.execute(`
                    INSERT INTO therapists (spa_id, fname, lname, nic, telno, email, specialty, status, rejection_reason)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    spaId,
                    therapist.fname,
                    therapist.lname,
                    therapist.nic,
                    therapist.telno,
                    therapist.email,
                    therapist.specialty,
                    therapist.status,
                    therapist.rejection_reason || null
                ]);
                console.log(`Added therapist: ${therapist.fname} ${therapist.lname} (${therapist.status})`);
            }

            console.log('Test data added successfully!');
        }

        // Check current data
        const [allTherapists] = await connection.execute(`
            SELECT t.*, s.name as spa_name 
            FROM therapists t 
            LEFT JOIN spas s ON t.spa_id = s.id
        `);
        console.log('\nCurrent therapists in database:');
        allTherapists.forEach(therapist => {
            console.log(`- ${therapist.fname} ${therapist.lname} (${therapist.status}) - ${therapist.spa_name || 'No Spa'}`);
        });

        await connection.end();
        console.log('\nDatabase connection closed.');

    } catch (error) {
        console.error('Database error:', error);
    }
}

checkAndAddTestData();
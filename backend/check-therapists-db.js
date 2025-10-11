// Check actual therapists data in the database
const mysql = require('mysql2/promise');

async function checkTherapistsDatabase() {
    console.log('🔍 Checking lsa_spa_management.therapists table...\n');

    try {
        // Create database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management',
            port: 3306
        });

        console.log('✅ Database connection successful');

        // Check table structure
        console.log('\n📋 Table Structure:');
        const [columns] = await connection.execute('DESCRIBE therapists');
        columns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Check total count
        const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM therapists');
        console.log(`\n📊 Total therapists in database: ${countResult[0].total}`);

        if (countResult[0].total > 0) {
            // Get actual therapists data
            console.log('\n👥 Actual Therapists Data:');
            const [therapists] = await connection.execute(`
                SELECT 
                    t.id,
                    t.fname,
                    t.lname,
                    t.nic,
                    t.telno,
                    t.email,
                    t.specialty,
                    t.birthday,
                    t.status,
                    t.nic_attachment_path,
                    t.medical_certificate_path,
                    t.spa_certificate_path,
                    t.therapist_image_path,
                    t.working_history,
                    t.created_at,
                    t.spa_id,
                    s.name as spa_name
                FROM therapists t
                LEFT JOIN spas s ON t.spa_id = s.id
                LIMIT 10
            `);

            therapists.forEach((therapist, index) => {
                console.log(`\n${index + 1}. ${therapist.fname || ''} ${therapist.lname || ''}`);
                console.log(`   ID: ${therapist.id}`);
                console.log(`   NIC: ${therapist.nic || 'Not set'}`);
                console.log(`   Phone: ${therapist.telno || 'Not set'}`);
                console.log(`   Email: ${therapist.email || 'Not set'}`);
                console.log(`   Specialty: ${therapist.specialty || 'Not set'}`);
                console.log(`   Status: ${therapist.status || 'Not set'}`);
                console.log(`   Spa: ${therapist.spa_name || 'Not assigned'}`);
                console.log(`   Documents:`);
                console.log(`     - NIC: ${therapist.nic_attachment_path || 'Not uploaded'}`);
                console.log(`     - Medical: ${therapist.medical_certificate_path || 'Not uploaded'}`);
                console.log(`     - Spa Cert: ${therapist.spa_certificate_path || 'Not uploaded'}`);
                console.log(`     - Image: ${therapist.therapist_image_path || 'Not uploaded'}`);
                console.log(`   Working History: ${therapist.working_history || 'None'}`);
            });
        } else {
            console.log('\n❌ No therapists found in database!');
            console.log('   The table exists but is empty.');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error checking database:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n💡 Table "therapists" does not exist in the database.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Database "lsa_spa_management" does not exist.');
        }
    }
}

// Run the check
checkTherapistsDatabase();
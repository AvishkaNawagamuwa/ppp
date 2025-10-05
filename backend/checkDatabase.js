const db = require('./config/database');

async function checkDatabaseStatus() {
    try {
        console.log('🔍 Checking database connection...');
        const connection = await db.getConnection();
        console.log('✅ Database connected successfully!');

        // Check if tables exist
        console.log('\n📋 Checking tables...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Available tables:', tables.map(t => Object.values(t)[0]));

        // Check spas table
        console.log('\n🏢 Checking SPAs data...');
        const [spas] = await connection.execute('SELECT id, name, verification_status, owner_fname, owner_lname FROM spas LIMIT 5');
        console.log(`SPAs in database: ${spas.length}`);
        spas.forEach(spa => {
            console.log(`- ${spa.name} (Owner: ${spa.owner_fname} ${spa.owner_lname}) - Status: ${spa.verification_status}`);
        });

        // Check therapists table
        console.log('\n👨‍⚕️ Checking Therapists data...');
        const [therapists] = await connection.execute('SELECT id, name, email, status, spa_id FROM therapists LIMIT 5');
        console.log(`Therapists in database: ${therapists.length}`);
        therapists.forEach(therapist => {
            console.log(`- ${therapist.name} (${therapist.email}) - Status: ${therapist.status} - SPA ID: ${therapist.spa_id}`);
        });

        // Check if notification table exists and has data
        try {
            console.log('\n🔔 Checking Notifications data...');
            const [notifications] = await connection.execute('SELECT id, message, recipient_type, is_read FROM system_notifications LIMIT 5');
            console.log(`Notifications in database: ${notifications.length}`);
            notifications.forEach(notification => {
                console.log(`- ${notification.message.substring(0, 50)}... (To: ${notification.recipient_type}, Read: ${notification.is_read})`);
            });
        } catch (error) {
            console.log('⚠️ system_notifications table does not exist or is empty');
        }

        // Check if activity logs exist
        try {
            console.log('\n📊 Checking Activity Logs data...');
            const [activities] = await connection.execute('SELECT id, entity_type, action, description FROM activity_logs LIMIT 5');
            console.log(`Activity logs in database: ${activities.length}`);
            activities.forEach(activity => {
                console.log(`- ${activity.entity_type} ${activity.action}: ${activity.description.substring(0, 40)}...`);
            });
        } catch (error) {
            console.log('⚠️ activity_logs table does not exist or is empty');
        }

        connection.release();

        // Summary
        console.log('\n📝 SUMMARY:');
        console.log(`- Database connection: ✅ Working`);
        console.log(`- SPAs: ${spas.length} records`);
        console.log(`- Therapists: ${therapists.length} records`);

    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('1. Make sure MySQL server is running');
        console.log('2. Check database credentials in config/database.js');
        console.log('3. Ensure database "lsa_spa_management" exists');
    }
}

checkDatabaseStatus();
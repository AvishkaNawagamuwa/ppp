const db = require('./config/database');

async function checkDatabaseStructure() {
    try {
        console.log('Checking database structure...');

        // Check spas table structure
        const [spaColumns] = await db.execute('DESCRIBE spas');
        console.log('\n=== SPAS TABLE STRUCTURE ===');
        spaColumns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Check therapists table structure
        const [therapistColumns] = await db.execute('DESCRIBE therapists');
        console.log('\n=== THERAPISTS TABLE STRUCTURE ===');
        therapistColumns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Check activity_logs table structure
        const [activityColumns] = await db.execute('DESCRIBE activity_logs');
        console.log('\n=== ACTIVITY_LOGS TABLE STRUCTURE ===');
        activityColumns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Check system_notifications table structure
        const [notificationColumns] = await db.execute('DESCRIBE system_notifications');
        console.log('\n=== SYSTEM_NOTIFICATIONS TABLE STRUCTURE ===');
        notificationColumns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Sample data check
        const [spaCount] = await db.execute('SELECT COUNT(*) as count FROM spas');
        const [therapistCount] = await db.execute('SELECT COUNT(*) as count FROM therapists');
        const [activityCount] = await db.execute('SELECT COUNT(*) as count FROM activity_logs');
        const [notificationCount] = await db.execute('SELECT COUNT(*) as count FROM system_notifications');

        console.log('\n=== DATA COUNTS ===');
        console.log(`Spas: ${spaCount[0].count}`);
        console.log(`Therapists: ${therapistCount[0].count}`);
        console.log(`Activity Logs: ${activityCount[0].count}`);
        console.log(`Notifications: ${notificationCount[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error('Error checking database structure:', error);
        process.exit(1);
    }
}

checkDatabaseStructure();
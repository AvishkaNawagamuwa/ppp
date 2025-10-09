const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function addTestData() {
    try {
        const connection = await mysql.createConnection(config);

        console.log('Connected to database successfully!');

        // Insert test activity logs
        const activities = [
            {
                entity_type: 'spa',
                entity_id: 1,
                action: 'status_changed',
                description: 'Spa verification status changed from pending to verified',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'pending',
                new_status: 'verified'
            },
            {
                entity_type: 'therapist',
                entity_id: 1,
                action: 'approved',
                description: 'Therapist application approved by LSA Admin',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'pending',
                new_status: 'approved'
            },
            {
                entity_type: 'spa',
                entity_id: 2,
                action: 'blacklisted',
                description: 'Spa blacklisted due to policy violations',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'verified',
                new_status: 'blacklisted'
            },
            {
                entity_type: 'therapist',
                entity_id: 2,
                action: 'rejected',
                description: 'Therapist application rejected - insufficient documentation',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'pending',
                new_status: 'rejected'
            }
        ];

        for (const activity of activities) {
            await connection.execute(`
        INSERT INTO activity_logs (
          entity_type, entity_id, action, description, actor_type, actor_id, actor_name, old_status, new_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
                activity.entity_type,
                activity.entity_id,
                activity.action,
                activity.description,
                activity.actor_type,
                activity.actor_id,
                activity.actor_name,
                activity.old_status,
                activity.new_status
            ]);
        }

        console.log(`✅ Added ${activities.length} test activity records`);

        // Check current counts
        const [spaCount] = await connection.execute("SELECT COUNT(*) as count FROM spas WHERE status = 'verified'");
        const [therapistCount] = await connection.execute("SELECT COUNT(*) as count FROM therapists WHERE status = 'approved'");
        const [activityCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM activity_logs 
      WHERE created_at >= CURDATE() - INTERVAL 1 DAY
    `);

        console.log(`📊 Current counts:`);
        console.log(`   Verified spas: ${spaCount[0].count}`);
        console.log(`   Approved therapists: ${therapistCount[0].count}`);
        console.log(`   Recent activities: ${activityCount[0].count}`);

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

addTestData();
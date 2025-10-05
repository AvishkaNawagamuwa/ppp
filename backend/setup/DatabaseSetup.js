const db = require('../config/database');

class DatabaseSetup {
    static async createMissingTables() {
        console.log('🏗️ Creating missing database tables...');

        try {
            // Create activity_logs table
            await db.execute(`
                CREATE TABLE IF NOT EXISTS activity_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    entity_type ENUM('spa', 'therapist', 'request') NOT NULL,
                    entity_id INT NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    description TEXT,
                    actor_type ENUM('spa', 'lsa') NOT NULL,
                    actor_id INT,
                    actor_name VARCHAR(255),
                    old_status VARCHAR(50),
                    new_status VARCHAR(50),
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_activity_entity (entity_type, entity_id),
                    INDEX idx_activity_actor (actor_type, actor_id),
                    INDEX idx_activity_created (created_at)
                )
            `);
            console.log('✅ Created activity_logs table');

            // Create system_notifications table
            await db.execute(`
                CREATE TABLE IF NOT EXISTS system_notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    recipient_type ENUM('spa', 'lsa') NOT NULL,
                    recipient_id INT,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
                    related_entity_type ENUM('spa', 'therapist', 'request'),
                    related_entity_id INT,
                    is_read BOOLEAN DEFAULT FALSE,
                    read_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_notification_recipient (recipient_type, recipient_id),
                    INDEX idx_notification_unread (is_read, created_at)
                )
            `);
            console.log('✅ Created system_notifications table');

            // Create therapist_requests table
            await db.execute(`
                CREATE TABLE IF NOT EXISTS therapist_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    therapist_id INT NOT NULL,
                    spa_id INT NOT NULL,
                    request_type ENUM('add', 'update', 'status_change') DEFAULT 'add',
                    request_status ENUM('pending', 'reviewed', 'approved', 'rejected') DEFAULT 'pending',
                    response_message TEXT,
                    response_date TIMESTAMP NULL,
                    responded_by VARCHAR(100),
                    spa_notes TEXT,
                    lsa_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
                    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE,
                    INDEX idx_request_status (request_status),
                    INDEX idx_request_spa (spa_id),
                    INDEX idx_request_therapist (therapist_id)
                )
            `);
            console.log('✅ Created therapist_requests table');

            // Create views for dashboard statistics
            await db.execute(`
                CREATE OR REPLACE VIEW spa_dashboard_stats AS
                SELECT 
                    s.id as spa_id,
                    s.name as spa_name,
                    COUNT(CASE WHEN t.status = 'approved' THEN 1 END) as approved_therapists,
                    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_requests,
                    COUNT(CASE WHEN t.status = 'rejected' THEN 1 END) as rejected_requests,
                    COUNT(CASE WHEN t.status = 'resigned' THEN 1 END) as resigned_therapists,
                    COUNT(CASE WHEN t.status = 'terminated' THEN 1 END) as terminated_therapists,
                    COUNT(t.id) as total_therapists
                FROM spas s
                LEFT JOIN therapists t ON s.id = t.spa_id
                GROUP BY s.id, s.name
            `);
            console.log('✅ Created spa_dashboard_stats view');

            await db.execute(`
                CREATE OR REPLACE VIEW lsa_dashboard_stats AS
                SELECT 
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_therapists,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
                    COUNT(CASE WHEN status = 'resigned' THEN 1 END) as resigned_therapists,
                    COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_therapists,
                    COUNT(id) as total_therapists
                FROM therapists
            `);
            console.log('✅ Created lsa_dashboard_stats view');

            await db.execute(`
                CREATE OR REPLACE VIEW recent_activity AS
                SELECT 
                    al.*,
                    CASE 
                        WHEN al.entity_type = 'therapist' THEN t.name
                        WHEN al.entity_type = 'spa' THEN s.name
                        ELSE 'System'
                    END as entity_name
                FROM activity_logs al
                LEFT JOIN therapists t ON al.entity_type = 'therapist' AND al.entity_id = t.id
                LEFT JOIN spas s ON al.entity_type = 'spa' AND al.entity_id = s.id
                ORDER BY al.created_at DESC
            `);
            console.log('✅ Created recent_activity view');

            console.log('🎉 All database tables and views created successfully!');
            return { success: true };

        } catch (error) {
            console.error('❌ Error creating database tables:', error);
            throw error;
        }
    }

    static async verifyTables() {
        console.log('🔍 Verifying database tables...');

        const tables = [
            'spas',
            'therapists',
            'therapist_requests',
            'activity_logs',
            'system_notifications'
        ];

        for (const table of tables) {
            try {
                const [rows] = await db.execute(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    console.log(`✅ Table '${table}' exists`);
                } else {
                    console.log(`❌ Table '${table}' missing`);
                }
            } catch (error) {
                console.log(`❌ Error checking table '${table}':`, error.message);
            }
        }
    }
}

module.exports = DatabaseSetup;

// Run setup if called directly
if (require.main === module) {
    DatabaseSetup.createMissingTables()
        .then(() => DatabaseSetup.verifyTables())
        .then(() => {
            console.log('🎉 Database setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Database setup failed:', error);
            process.exit(1);
        });
}
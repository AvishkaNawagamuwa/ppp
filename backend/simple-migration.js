const mysql = require('mysql2/promise');

async function runSimpleMigration() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'lsa_spa_management'
    });

    try {
        console.log('✅ Connected to database');

        // Add columns one by one to avoid syntax issues
        const migrations = [
            "ALTER TABLE spas ADD COLUMN reference_number VARCHAR(20) UNIQUE",
            "ALTER TABLE spas ADD COLUMN blacklist_reason TEXT",
            "ALTER TABLE spas ADD COLUMN blacklisted_at TIMESTAMP NULL",
            "ALTER TABLE spas ADD COLUMN next_payment_date DATE DEFAULT '2025-12-31'",
            "ALTER TABLE spas ADD COLUMN payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending'",
            "ALTER TABLE spas ADD COLUMN form1_certificate_path VARCHAR(500)",
            "ALTER TABLE spas ADD COLUMN spa_photos_banner_path VARCHAR(500)",
            "ALTER TABLE spas ADD COLUMN annual_fee_paid BOOLEAN DEFAULT FALSE"
        ];

        for (const migration of migrations) {
            try {
                await connection.execute(migration);
                console.log('✅', migration);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log('⚠️  Column already exists:', migration);
                } else {
                    console.log('❌', migration, ':', error.message);
                }
            }
        }

        // Create new tables
        console.log('Creating new tables...');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                spa_id INT NOT NULL,
                payment_type ENUM('registration', 'annual', 'monthly') DEFAULT 'registration',
                payment_method ENUM('card', 'bank_transfer') NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
                reference_number VARCHAR(50) UNIQUE NOT NULL,
                bank_slip_path VARCHAR(500) NULL,
                bank_transfer_approved BOOLEAN DEFAULT FALSE,
                approval_date TIMESTAMP NULL,
                approved_by VARCHAR(100) NULL,
                rejection_reason TEXT NULL,
                payhere_order_id VARCHAR(100) NULL,
                payhere_payment_id VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Payments table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin_lsa', 'admin_spa', 'government_officer') NOT NULL,
                spa_id INT NULL,
                is_temporary BOOLEAN DEFAULT FALSE,
                expires_at TIMESTAMP NULL,
                created_by INT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NULL,
                department VARCHAR(100) NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Admin users table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                author_id INT NOT NULL,
                featured_image VARCHAR(500) NULL,
                status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                published_at TIMESTAMP NULL
            )
        `);
        console.log('✅ Blogs table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS blog_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                blog_id INT NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type ENUM('image', 'video', 'document') NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Blog media table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                image_path VARCHAR(500) NOT NULL,
                category VARCHAR(100) DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Gallery table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS financial_summaries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                month INT NOT NULL,
                year INT NOT NULL,
                total_registration_fees DECIMAL(12,2) DEFAULT 0,
                total_annual_fees DECIMAL(12,2) DEFAULT 0,
                total_monthly_fees DECIMAL(12,2) DEFAULT 0,
                total_spas_registered INT DEFAULT 0,
                total_payments_processed INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_month_year (month, year)
            )
        `);
        console.log('✅ Financial summaries table created');

        // Add working history to therapists if not exists
        try {
            await connection.execute("ALTER TABLE therapists ADD COLUMN working_history JSON");
            console.log('✅ Working history column added to therapists');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  Working history column already exists');
            }
        }

        // Insert default admin users
        try {
            await connection.execute(`
                INSERT IGNORE INTO admin_users (username, email, password_hash, role, full_name, phone) VALUES 
                ('lsa_admin', 'admin@lsa.gov.lk', '$2b$10$K4Jt6P4KgVFxvXs4M1QgFOLtYdMVmO3wXn5K8L9qDwE7Ry4A3B6C2', 'admin_lsa', 'LSA Administrator', '+94771234567')
            `);
            console.log('✅ Default admin user created');
        } catch (error) {
            console.log('⚠️  Admin user might already exist');
        }

        // Update existing spas with reference numbers
        await connection.execute(`
            UPDATE spas SET reference_number = CONCAT('LSA', LPAD(id, 4, '0')) 
            WHERE reference_number IS NULL OR reference_number = ''
        `);
        console.log('✅ Reference numbers generated for existing spas');

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await connection.end();
    }
}

runSimpleMigration();

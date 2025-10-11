const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management',
    port: 3306
};

async function checkAndCreateTables() {
    try {
        const connection = await mysql.createConnection(config);

        console.log('🔍 Checking existing tables...\n');

        // Check existing tables
        const [tables] = await connection.execute('SHOW TABLES');

        console.log('Existing tables:');
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

        console.log('\n📝 Creating missing tables...\n');

        // Create blog_posts table
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS blog_posts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    author_id INT,
                    status ENUM('draft', 'published') DEFAULT 'published',
                    featured_image VARCHAR(255),
                    excerpt TEXT,
                    tags JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL
                )
            `);
            console.log('✅ Created blog_posts table');
        } catch (error) {
            console.log('ℹ️  blog_posts table already exists or error:', error.message);
        }

        // Create blog_media table
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS blog_media (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    blog_id INT NOT NULL,
                    file_path VARCHAR(255) NOT NULL,
                    file_type VARCHAR(50) NOT NULL,
                    file_size INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Created blog_media table');
        } catch (error) {
            console.log('ℹ️  blog_media table already exists or error:', error.message);
        }

        // Create gallery table if needed
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS gallery (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    original_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(255) NOT NULL,
                    file_size INT,
                    mime_type VARCHAR(100),
                    uploaded_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
                )
            `);
            console.log('✅ Created gallery table');
        } catch (error) {
            console.log('ℹ️  gallery table already exists or error:', error.message);
        }

        console.log('\n🎉 Database table check/creation completed!');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAndCreateTables();
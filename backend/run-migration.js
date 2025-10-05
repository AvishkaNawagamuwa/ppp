const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'lsa_spa_management',
        multipleStatements: true
    });

    try {
        console.log('✅ Connected to database');

        const migrationSql = fs.readFileSync(path.join(__dirname, 'migrations', '001_enhance_database.sql'), 'utf8');

        console.log('📁 Migration file loaded');
        console.log('🔄 Running migration...');

        await connection.execute(migrationSql);

        console.log('✅ Migration completed successfully!');

        // Verify the changes
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Current tables:', tables.map(t => Object.values(t)[0]));

        const [spaColumns] = await connection.execute('DESCRIBE spas');
        console.log('🏢 Spa table columns:', spaColumns.map(c => c.Field));

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await connection.end();
    }
}

runMigration();

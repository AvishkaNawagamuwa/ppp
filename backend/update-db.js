const db = require('./config/database');
const fs = require('fs');

async function updateDatabase() {
    try {
        console.log('🔄 Starting database updates...');

        // Read and execute database updates
        const sql = fs.readFileSync('./database-updates.sql', 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await db.execute(statement.trim());
                    console.log('✅ Executed:', statement.substring(0, 80).replace(/\n/g, ' ') + '...');
                } catch (err) {
                    if (!err.message.includes('Duplicate column') && !err.message.includes('already exists')) {
                        throw err;
                    }
                    console.log('ℹ️ Skipped (already exists):', statement.substring(0, 50) + '...');
                }
            }
        }

        console.log('🎉 Database updated successfully!');
        console.log('📊 Verifying therapists table structure...');

        const [rows] = await db.execute('DESCRIBE therapists');
        console.log('Therapists table columns:', rows.map(r => r.Field));

    } catch (error) {
        console.error('❌ Database update error:', error.message);
    }
    process.exit();
}

updateDatabase();
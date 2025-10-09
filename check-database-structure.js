const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection(config);

        console.log('Connected to database successfully!');

        // Check if database exists
        const [databases] = await connection.execute('SHOW DATABASES LIKE "lsa_spa_management"');
        console.log('Database exists:', databases.length > 0);

        if (databases.length > 0) {
            // Check tables
            const [tables] = await connection.execute('SHOW TABLES');
            console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

            // Check spas table structure
            try {
                const [spaColumns] = await connection.execute('DESCRIBE spas');
                console.log('\nSpas table columns:');
                spaColumns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
            } catch (err) {
                console.log('Spas table does not exist');
            }

            // Check therapists table structure
            try {
                const [therapistColumns] = await connection.execute('DESCRIBE therapists');
                console.log('\nTherapists table columns:');
                therapistColumns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
            } catch (err) {
                console.log('Therapists table does not exist');
            }

            // Check activity_logs table structure
            try {
                const [activityColumns] = await connection.execute('DESCRIBE activity_logs');
                console.log('\nActivity_logs table columns:');
                activityColumns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
            } catch (err) {
                console.log('Activity_logs table does not exist');
            }

            // Check data counts
            try {
                const [spaCount] = await connection.execute('SELECT COUNT(*) as count FROM spas');
                console.log(`\nSpas count: ${spaCount[0].count}`);

                const [therapistCount] = await connection.execute('SELECT COUNT(*) as count FROM therapists');
                console.log(`Therapists count: ${therapistCount[0].count}`);
            } catch (err) {
                console.log('Error counting records:', err.message);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
}

checkDatabase();
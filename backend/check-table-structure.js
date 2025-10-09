const db = require('./config/database');

async function checkTableStructure() {
    try {
        const [rows] = await db.execute('DESCRIBE therapists');
        console.log('Therapists table structure:');
        rows.forEach(row => {
            console.log(`${row.Field}: ${row.Type} ${row.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${row.Default ? 'DEFAULT=' + row.Default : ''}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
    process.exit();
}

checkTableStructure();
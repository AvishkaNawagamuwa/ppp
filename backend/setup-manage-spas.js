// Quick setup script for ManageSpas testing
const fs = require('fs');
const path = require('path');

async function setupSampleData() {
    console.log('🔧 Setting up sample data for ManageSpas testing...\n');

    try {
        const db = require('./config/database');

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'add-sample-spa-data.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL statements (basic splitting)
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));

        console.log(`📝 Executing ${statements.length} SQL statements...\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await db.execute(statement);
                    if (statement.toLowerCase().includes('insert into spas')) {
                        console.log('✅ Sample spa data inserted');
                    } else if (statement.toLowerCase().includes('update spas')) {
                        console.log('✅ Spa data updated');
                    } else if (statement.toLowerCase().includes('select')) {
                        const [results] = await db.execute(statement);
                        if (results && results[0]) {
                            console.log('📊 Data Summary:');
                            console.log('   Total Spas:', results[0].Total_Spas);
                            console.log('   Verified:', results[0].Verified);
                            console.log('   Unverified:', results[0].Unverified);
                            console.log('   Blacklisted:', results[0].Blacklisted);
                            console.log('   Pending:', results[0].Pending);
                            console.log('   Rejected:', results[0].Rejected);
                        }
                    }
                } catch (error) {
                    if (!error.message.includes('Duplicate entry')) {
                        console.log('⚠️ SQL Error:', error.message);
                    }
                }
            }
        }

        console.log('\n🎯 Testing API endpoints...\n');

        // Test the API
        const testAPI = require('./test-manage-spas-api');
        await testAPI();

        console.log('✅ Setup completed successfully!');
        console.log('\n🌐 You can now test the ManageSpas UI at: http://localhost:5173/admin/manage-spas');
        console.log('🚀 Backend server should be running at: http://localhost:5000');

    } catch (error) {
        console.error('❌ Setup error:', error.message);
    } finally {
        process.exit(0);
    }
}

// Run setup
setupSampleData();
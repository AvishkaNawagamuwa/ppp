const db = require('./config/database');

async function updateTherapistTable() {
    try {
        console.log('🔄 Updating therapists table structure...');

        // Check existing columns
        const [existingColumns] = await db.execute('DESCRIBE therapists');
        const columnNames = existingColumns.map(col => col.Field);
        console.log('📋 Existing columns:', columnNames);

        // Define columns to add
        const columnsToAdd = [
            { name: 'first_name', sql: 'ALTER TABLE therapists ADD COLUMN first_name VARCHAR(100) AFTER name' },
            { name: 'last_name', sql: 'ALTER TABLE therapists ADD COLUMN last_name VARCHAR(100) AFTER first_name' },
            { name: 'date_of_birth', sql: 'ALTER TABLE therapists ADD COLUMN date_of_birth DATE AFTER last_name' },
            { name: 'nic_number', sql: 'ALTER TABLE therapists ADD COLUMN nic_number VARCHAR(20) AFTER nic' },
            { name: 'nic_attachment', sql: 'ALTER TABLE therapists ADD COLUMN nic_attachment VARCHAR(500) AFTER certificate_path' },
            { name: 'medical_certificate', sql: 'ALTER TABLE therapists ADD COLUMN medical_certificate VARCHAR(500) AFTER nic_attachment' },
            { name: 'spa_center_certificate', sql: 'ALTER TABLE therapists ADD COLUMN spa_center_certificate VARCHAR(500) AFTER medical_certificate' },
            { name: 'therapist_image', sql: 'ALTER TABLE therapists ADD COLUMN therapist_image VARCHAR(500) AFTER spa_center_certificate' }
        ];

        // Add columns if they don't exist
        for (const column of columnsToAdd) {
            if (!columnNames.includes(column.name)) {
                try {
                    await db.execute(column.sql);
                    console.log('✅ Added column:', column.name);
                } catch (error) {
                    console.log('❌ Error adding column', column.name, ':', error.message);
                }
            } else {
                console.log('ℹ️  Column already exists:', column.name);
            }
        }

        // Update status enum (always run this)
        try {
            await db.execute(`ALTER TABLE therapists MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'resigned', 'terminated', 'suspend') DEFAULT 'pending'`);
            console.log('✅ Updated status enum');
        } catch (error) {
            console.log('ℹ️  Status enum already up to date or error:', error.message);
        }

        // Verify the updated structure
        console.log('\n📋 Updated therapists table structure:');
        const [columns] = await db.execute('DESCRIBE therapists');
        columns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        console.log('\n✅ Therapists table update completed successfully!');

        // Test insert with new structure
        console.log('\n🧪 Testing insert with new structure...');
        const testData = {
            spa_id: 1,
            name: 'Test Therapist Full',
            first_name: 'Test',
            last_name: 'Therapist',
            date_of_birth: '1990-01-01',
            nic: '901234567V',
            nic_number: '901234567V',
            email: 'test@spa.com',
            phone: '+94771234567',
            address: 'Test Address',
            status: 'pending'
        };

        const [result] = await db.execute(`
            INSERT INTO therapists (spa_id, name, first_name, last_name, date_of_birth, nic, nic_number, email, phone, address, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            testData.spa_id, testData.name, testData.first_name, testData.last_name,
            testData.date_of_birth, testData.nic, testData.nic_number,
            testData.email, testData.phone, testData.address, testData.status
        ]);

        console.log('✅ Test insert successful! New ID:', result.insertId);

        // Clean up test data
        await db.execute('DELETE FROM therapists WHERE id = ?', [result.insertId]);
        console.log('🧹 Test data cleaned up');

    } catch (error) {
        console.error('❌ Error updating therapists table:', error);
        throw error;
    }
}

// Run the update
updateTherapistTable()
    .then(() => {
        console.log('\n🎉 Database update completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Database update failed:', error);
        process.exit(1);
    });
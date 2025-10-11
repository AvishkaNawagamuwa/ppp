const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function createAndTestGovOfficer() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'lsa_spa_management'
    });

    try {
        console.log('🏛️ Creating Government Officer Account...\n');

        // 1. Create a government officer
        const username = 'test_officer_' + Date.now();
        const password = 'TestPass123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(`
            INSERT INTO admin_users (
                username, email, password_hash, role, full_name, department, is_active
            ) VALUES (?, ?, ?, 'government_officer', ?, ?, true)
        `, [
            username,
            `${username}@gov.lk`,
            hashedPassword,
            'Test Government Officer',
            'Ministry of Health - Spa Regulation Division'
        ]);

        console.log('✅ Government officer created:');
        console.log('   Username:', username);
        console.log('   Password:', password);
        console.log('   ID:', result.insertId);

        // 2. Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, username: username, role: 'government_officer' },
            'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('🔑 JWT Token:', token);

        // 3. Test the API with this token
        console.log('\n🧪 Testing API with real token...');

        const axios = require('axios');

        // Test user info
        try {
            const userResponse = await axios.get('http://localhost:3001/api/third-party/user-info', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ User info successful:', userResponse.data);
        } catch (error) {
            console.log('❌ User info failed:', error.response?.data || error.message);
        }

        // Test therapists search
        try {
            const therapistsResponse = await axios.get('http://localhost:3001/api/third-party/therapists/search', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Therapists search successful!');
            console.log('📊 Found therapists:', therapistsResponse.data.data?.therapists?.length || 0);

            if (therapistsResponse.data.data?.therapists?.length > 0) {
                const sample = therapistsResponse.data.data.therapists[0];
                console.log('📋 Sample therapist:');
                console.log('   - Name:', sample.name);
                console.log('   - NIC:', sample.nicNumber);
                console.log('   - Status:', sample.status);
            }
        } catch (error) {
            console.log('❌ Therapists search failed:', error.response?.data || error.message);
        }

        console.log('\n🔧 Frontend Setup Instructions:');
        console.log('Replace the demo token with this real token:');
        console.log(`localStorage.setItem('thirdPartyToken', '${token}');`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.end();
    }
}

createAndTestGovOfficer();
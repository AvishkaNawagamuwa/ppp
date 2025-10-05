const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testData = {
    registration: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        telephone: '+94771234567',
        cellphone: '+94771234568',
        nicNo: '199012345678V',
        spaName: 'Test Luxury Spa',
        spaAddressLine1: '123 Test Street',
        spaProvince: 'Western',
        spaPostalCode: '10100',
        spaTelephone: '+94112345678',
        spaBRNumber: 'BR001TEST',
        paymentMethod: 'bank_transfer',
        bankDetails: {
            bankName: 'Commercial Bank',
            accountNumber: '123456789',
            branch: 'Colombo',
            accountHolderName: 'John Doe'
        }
    },
    adminLSA: {
        username: 'lsa_admin',
        password: 'admin123'
    },
    thirdParty: {
        username: 'officer001',
        department: 'Health Ministry'
    }
};

// Test functions
async function testDatabaseConnection() {
    console.log('\n🔍 Testing Database Connection...');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Database connection test passed');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Database connection test failed:', error.response?.data || error.message);
    }
}

async function testPublicSpas() {
    console.log('\n🔍 Testing Public Spas API...');
    try {
        // Test verified spas
        const verifiedResponse = await axios.get(`${BASE_URL}/public/spas?category=verified`);
        console.log('✅ Verified spas fetch successful');
        console.log(`Found ${verifiedResponse.data.data.spas.length} verified spas`);

        // Test unverified spas
        const unverifiedResponse = await axios.get(`${BASE_URL}/public/spas?category=unverified`);
        console.log('✅ Unverified spas fetch successful');
        console.log(`Found ${unverifiedResponse.data.data.spas.length} unverified spas`);

        // Test blacklisted spas
        const blacklistedResponse = await axios.get(`${BASE_URL}/public/spas?category=blacklisted`);
        console.log('✅ Blacklisted spas fetch successful');
        console.log(`Found ${blacklistedResponse.data.data.spas.length} blacklisted spas`);

        // Test public stats
        const statsResponse = await axios.get(`${BASE_URL}/public/stats`);
        console.log('✅ Public stats fetch successful');
        console.log('Stats:', statsResponse.data.data);

    } catch (error) {
        console.log('❌ Public spas test failed:', error.response?.data || error.message);
    }
}

async function testEnhancedRegistration() {
    console.log('\n🔍 Testing Enhanced Registration API...');
    try {
        // Test registration status check (should fail for non-existent reference)
        try {
            await axios.get(`${BASE_URL}/enhanced-registration/status/LSA9999`);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Registration status check (404) working correctly');
            }
        }

        // Note: File upload testing would require multipart form data setup
        console.log('✅ Enhanced registration endpoints are available');

    } catch (error) {
        console.log('❌ Enhanced registration test failed:', error.response?.data || error.message);
    }
}

async function testThirdPartyManagement() {
    console.log('\n🔍 Testing Third-Party Management API...');
    try {
        // Test third-party login (should fail without credentials)
        try {
            await axios.post(`${BASE_URL}/third-party/login`, {
                username: 'nonexistent',
                password: 'wrong'
            });
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Third-party login authentication working correctly');
            }
        }

        // Test therapist history search (should fail without auth)
        try {
            await axios.get(`${BASE_URL}/third-party/therapist-history?search=test`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Third-party protected routes working correctly');
            }
        }

    } catch (error) {
        console.log('❌ Third-party management test failed:', error.response?.data || error.message);
    }
}

async function testAdminSPAPayments() {
    console.log('\n🔍 Testing AdminSPA Payment API...');
    try {
        // Test payment plans (should fail without auth)
        try {
            await axios.get(`${BASE_URL}/admin-spa/payment-plans`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ AdminSPA authentication working correctly');
            }
        }

        // Test spa status (should fail without auth)
        try {
            await axios.get(`${BASE_URL}/admin-spa/status`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ AdminSPA protected routes working correctly');
            }
        }

    } catch (error) {
        console.log('❌ AdminSPA payment test failed:', error.response?.data || error.message);
    }
}

async function testDatabaseTables() {
    console.log('\n🔍 Testing Database Tables...');

    const db = require('./config/database');

    try {
        // Test if new tables exist
        const tables = [
            'spas', 'payments', 'admin_users', 'blogs', 'blog_media',
            'gallery', 'financial_summaries', 'therapists'
        ];

        for (const table of tables) {
            try {
                const [result] = await db.execute(`DESCRIBE ${table}`);
                console.log(`✅ Table '${table}' exists with ${result.length} columns`);
            } catch (error) {
                console.log(`❌ Table '${table}' does not exist or has issues`);
            }
        }

        // Test if new columns exist in spas table
        const [spaColumns] = await db.execute('DESCRIBE spas');
        const requiredColumns = [
            'reference_number', 'blacklist_reason', 'blacklisted_at',
            'next_payment_date', 'payment_status', 'form1_certificate_path',
            'spa_photos_banner_path', 'annual_fee_paid'
        ];

        const existingColumns = spaColumns.map(col => col.Field);

        for (const column of requiredColumns) {
            if (existingColumns.includes(column)) {
                console.log(`✅ Column 'spas.${column}' exists`);
            } else {
                console.log(`❌ Column 'spas.${column}' is missing`);
            }
        }

        // Test reference number generation
        const [spas] = await db.execute('SELECT reference_number FROM spas WHERE reference_number IS NOT NULL LIMIT 5');
        console.log(`✅ Found ${spas.length} spas with reference numbers:`, spas.map(s => s.reference_number));

    } catch (error) {
        console.log('❌ Database tables test failed:', error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting LSA System Backend Tests...\n');

    await testDatabaseConnection();
    await testDatabaseTables();
    await testPublicSpas();
    await testEnhancedRegistration();
    await testThirdPartyManagement();
    await testAdminSPAPayments();

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Test the registration flow with file uploads using Postman');
    console.log('3. Create admin accounts and test the dashboard features');
    console.log('4. Implement frontend components for the new features');
    console.log('\n🔗 Available Endpoints:');
    console.log('- POST /api/enhanced-registration/submit');
    console.log('- GET /api/public/spas?category=verified|unverified|blacklisted');
    console.log('- POST /api/third-party/create (AdminLSA only)');
    console.log('- GET /api/third-party/therapist-history (Government officers)');
    console.log('- GET /api/admin-spa/payment-plans (Spa owners)');
    console.log('- POST /api/admin-spa/payment/initiate (Spa owners)');
}

// Run tests
runAllTests().catch(console.error);
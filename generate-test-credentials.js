const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function createTestSpa(spaName, ownerFirstName, ownerLastName, email) {
    try {
        const formData = new FormData();

        // Basic spa information
        formData.append('spaName', spaName);
        formData.append('firstName', ownerFirstName);
        formData.append('lastName', ownerLastName);
        formData.append('spaTelephone', '+94711234567');
        formData.append('email', email);
        formData.append('nicNo', '991234567V');

        // Address information
        formData.append('spaAddressLine1', '123 Test Street');
        formData.append('spaAddressLine2', 'Test Area');
        formData.append('spaCity', 'Colombo');
        formData.append('spaProvince', 'Western');
        formData.append('spaPostalCode', '00100');

        // Business details
        formData.append('spaBRNumber', 'BR' + Date.now());
        formData.append('spaDescription', `${spaName} - Premium wellness services`);

        // Payment information
        formData.append('paymentMethod', 'card');
        formData.append('paymentReference', 'TEST_' + Date.now());

        // Create test files directory
        const testDir = path.join(__dirname, 'test-files');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        // Create minimal test files
        const testImagePath = path.join(testDir, 'test-image.jpg');
        const testPdfPath = path.join(testDir, 'test-document.pdf');

        if (!fs.existsSync(testImagePath)) {
            fs.writeFileSync(testImagePath, Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]));
        }
        if (!fs.existsSync(testPdfPath)) {
            fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4\n%EOF'));
        }

        // Add required file uploads
        formData.append('nicFront', fs.createReadStream(testImagePath));
        formData.append('nicBack', fs.createReadStream(testImagePath));
        formData.append('brAttachment', fs.createReadStream(testPdfPath));
        formData.append('form1Certificate', fs.createReadStream(testPdfPath));
        formData.append('spaPhotosBanner', fs.createReadStream(testImagePath));

        // Submit registration
        const response = await axios.post(
            'http://localhost:3001/api/enhanced-registration/submit',
            formData,
            {
                headers: { ...formData.getHeaders() },
                timeout: 30000
            }
        );

        if (response.data.success && response.data.data.credentials) {
            const data = response.data.data;
            return {
                success: true,
                spa: {
                    name: data.spaName,
                    owner: data.ownerName,
                    reference: data.referenceNumber,
                    username: data.credentials.username,
                    password: data.credentials.password
                }
            };
        }

        return { success: false, error: 'No credentials returned' };

    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

async function generateTestSpas() {
    console.log('🏢 Generating Test Spas with Login Credentials');
    console.log('='.repeat(70));
    console.log('');

    const testSpas = [
        { name: 'Golden Lotus Wellness', firstName: 'Priya', lastName: 'Fernando', email: `priya${Date.now()}@test.com` },
        { name: 'Serenity Paradise Spa', firstName: 'Kamal', lastName: 'Silva', email: `kamal${Date.now()}@test.com` },
        { name: 'Tranquil Waters Resort', firstName: 'Nisha', lastName: 'Perera', email: `nisha${Date.now()}@test.com` },
        { name: 'Harmony Health Center', firstName: 'Rohan', lastName: 'Jayawardena', email: `rohan${Date.now()}@test.com` },
        { name: 'Blissful Retreat Spa', firstName: 'Amara', lastName: 'Rodrigo', email: `amara${Date.now()}@test.com` }
    ];

    const credentials = [];

    for (let i = 0; i < testSpas.length; i++) {
        const spa = testSpas[i];
        console.log(`📝 Creating spa ${i + 1}/5: ${spa.name}...`);

        const result = await createTestSpa(spa.name, spa.firstName, spa.lastName, spa.email);

        if (result.success) {
            credentials.push(result.spa);
            console.log(`✅ Created successfully!`);
        } else {
            console.log(`❌ Failed: ${result.error}`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Clean up test files
    const testDir = path.join(__dirname, 'test-files');
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }

    console.log('');
    console.log('🔐 TEST CREDENTIALS FOR MANUAL LOGIN TESTING');
    console.log('='.repeat(70));

    if (credentials.length === 0) {
        console.log('❌ No credentials were generated successfully.');
        console.log('Please check if the backend server is running on http://localhost:3001');
        return;
    }

    credentials.forEach((spa, index) => {
        console.log(`\n${index + 1}. ${spa.name}`);
        console.log(`   Owner: ${spa.owner}`);
        console.log(`   Reference: ${spa.reference}`);
        console.log(`   Username: ${spa.username}`);
        console.log(`   Password: ${spa.password}`);
        console.log(`   Login URL: http://localhost:5173/login`);
    });

    console.log('');
    console.log('🧪 HOW TO TEST:');
    console.log('1. Go to http://localhost:5173/login');
    console.log('2. Use any of the username/password combinations above');
    console.log('3. Each login should show a different spa dashboard');
    console.log('4. Verify that the spa name and owner match what you logged in with');
    console.log('');
    console.log('✅ Test complete! You now have 5 different spa credentials to test with.');
}

// Run the generator
generateTestSpas();
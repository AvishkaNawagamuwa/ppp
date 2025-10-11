const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test spa data for multiple registrations
const testSpas = [
    {
        spaName: 'Luxury Wellness Resort',
        firstName: 'Amara',
        lastName: 'Silva',
        email: 'amara.silva@luxurywellness.lk'
    },
    {
        spaName: 'Tranquil Mind Spa',
        firstName: 'Rukmal',
        lastName: 'Perera',
        email: 'rukmal.perera@tranquil.lk'
    },
    {
        spaName: 'Ocean Breeze Wellness',
        firstName: 'Sanduni',
        lastName: 'Fernando',
        email: 'sanduni.fernando@oceanbreeze.lk'
    },
    {
        spaName: 'Mountain View Retreat',
        firstName: 'Kasun',
        lastName: 'Jayawardena',
        email: 'kasun.jay@mountainview.lk'
    },
    {
        spaName: 'Royal Ayurveda Center',
        firstName: 'Priyanka',
        lastName: 'Rathnayake',
        email: 'priyanka.r@royalayurveda.lk'
    }
];

async function createTestFiles() {
    const testDir = path.join(__dirname, 'test-files');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test files
    const testImagePath = path.join(testDir, 'test-image.jpg');
    const testPdfPath = path.join(testDir, 'test-document.pdf');

    // Create minimal valid files
    fs.writeFileSync(testImagePath, Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]));
    fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4\n%EOF'));

    return { testImagePath, testPdfPath, testDir };
}

async function registerSpa(spaData, testImagePath, testPdfPath) {
    try {
        const formData = new FormData();

        // Basic spa information
        formData.append('spaName', spaData.spaName);
        formData.append('firstName', spaData.firstName);
        formData.append('lastName', spaData.lastName);
        formData.append('spaTelephone', '+94711234567');
        formData.append('email', spaData.email);
        formData.append('nicNo', '991234567V');

        // Address information
        formData.append('spaAddressLine1', '123 Test Street');
        formData.append('spaAddressLine2', 'Test Area');
        formData.append('spaCity', 'Colombo');
        formData.append('spaProvince', 'Western');
        formData.append('spaPostalCode', '00100');

        // Business details
        formData.append('spaBRNumber', 'BR' + Date.now());
        formData.append('spaDescription', `${spaData.spaName} - Premium wellness services`);

        // Payment information
        formData.append('paymentMethod', 'card');
        formData.append('paymentReference', 'TEST_' + Date.now());

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

        return response.data;

    } catch (error) {
        console.error(`❌ Failed to register ${spaData.spaName}:`, error.response?.data?.error || error.message);
        return null;
    }
}

async function generateTestSpas() {
    console.log('🏢 Creating Multiple Test Spas for Dashboard Testing');
    console.log('='.repeat(70));

    const { testImagePath, testPdfPath, testDir } = await createTestFiles();
    const credentials = [];

    for (let i = 0; i < testSpas.length; i++) {
        const spa = testSpas[i];
        console.log(`\n📝 Registering Spa ${i + 1}/5: ${spa.spaName}`);
        console.log(`   Owner: ${spa.firstName} ${spa.lastName}`);
        console.log(`   Email: ${spa.email}`);

        const result = await registerSpa(spa, testImagePath, testPdfPath);

        if (result && result.success) {
            const cred = {
                spaName: result.data.spaName,
                ownerName: result.data.ownerName,
                referenceNumber: result.data.referenceNumber,
                username: result.data.credentials.username,
                password: result.data.credentials.password,
                email: spa.email
            };

            credentials.push(cred);
            console.log(`   ✅ Success! Username: ${cred.username} | Password: ${cred.password}`);
        } else {
            console.log(`   ❌ Registration failed`);
        }

        // Small delay between registrations
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Clean up test files
    fs.unlinkSync(testImagePath);
    fs.unlinkSync(testPdfPath);
    fs.rmSync(testDir, { recursive: true, force: true });

    // Display all credentials
    console.log('\n' + '='.repeat(70));
    console.log('🔐 TEST SPA LOGIN CREDENTIALS');
    console.log('='.repeat(70));
    console.log('Use these credentials to test different spa dashboards:\n');

    credentials.forEach((cred, index) => {
        console.log(`${index + 1}. ${cred.spaName}`);
        console.log(`   Owner: ${cred.ownerName}`);
        console.log(`   Username: ${cred.username}`);
        console.log(`   Password: ${cred.password}`);
        console.log(`   Reference: ${cred.referenceNumber}`);
        console.log(`   Email: ${cred.email}`);
        console.log('');
    });

    console.log('🌐 Login URL: http://localhost:5173/login');
    console.log('📱 Each login should show different spa dashboard with correct spa name and owner!');
    console.log('\n✅ Test complete! Try logging in with different credentials to verify dynamic loading.');

    return credentials;
}

// Run the test
generateTestSpas().catch(console.error);
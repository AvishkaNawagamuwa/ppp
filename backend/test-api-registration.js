const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testRegistrationAPI() {
    try {
        console.log('🚀 Testing Registration API...\n');

        // Create a test form data
        const form = new FormData();

        // Basic spa information
        form.append('spaName', 'Test Serenity Spa');
        form.append('spaBRNumber', `BR${Date.now()}`);
        form.append('spaTelephone', '0112345678');

        // Owner information
        form.append('firstName', 'John');
        form.append('lastName', 'Doe');
        form.append('email', `testowner${Date.now()}@example.com`);
        form.append('nicNo', `${Date.now()}V`.substring(0, 12));
        form.append('telephone', '0112345678');
        form.append('cellphone', '0771234567');

        // Address information
        form.append('spaAddressLine1', '123 Test Street');
        form.append('spaAddressLine2', 'Test Area');
        form.append('spaProvince', 'Western');
        form.append('spaPostalCode', '10100');

        // Payment information
        form.append('paymentMethod', 'bank_transfer');

        // Create dummy files for testing
        const dummyImagePath = path.join(__dirname, 'test-dummy.jpg');
        const dummyPdfPath = path.join(__dirname, 'test-dummy.pdf');

        // Create a simple dummy image file if it doesn't exist
        if (!fs.existsSync(dummyImagePath)) {
            // Create a minimal valid JPEG file header
            const dummyJpeg = Buffer.from([
                0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
                0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
            ]);
            fs.writeFileSync(dummyImagePath, dummyJpeg);
        }

        // Create a simple dummy PDF file if it doesn't exist
        if (!fs.existsSync(dummyPdfPath)) {
            // Create a minimal valid PDF file header
            const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF');
            fs.writeFileSync(dummyPdfPath, dummyPdf);
        }

        // Add required files with proper types
        form.append('nicFront', fs.createReadStream(dummyImagePath), 'nic-front.jpg');
        form.append('nicBack', fs.createReadStream(dummyImagePath), 'nic-back.jpg');
        form.append('brAttachment', fs.createReadStream(dummyPdfPath), 'br-certificate.pdf');
        form.append('form1Certificate', fs.createReadStream(dummyPdfPath), 'form1-cert.pdf');
        form.append('spaPhotosBanner', fs.createReadStream(dummyImagePath), 'spa-banner.jpg');
        form.append('bankSlip', fs.createReadStream(dummyImagePath), 'bank-slip.jpg');
        form.append('facilityPhotos', fs.createReadStream(dummyImagePath), 'facility1.jpg');
        form.append('facilityPhotos', fs.createReadStream(dummyImagePath), 'facility2.jpg');
        form.append('facilityPhotos', fs.createReadStream(dummyImagePath), 'facility3.jpg');
        form.append('facilityPhotos', fs.createReadStream(dummyImagePath), 'facility4.jpg');
        form.append('facilityPhotos', fs.createReadStream(dummyImagePath), 'facility5.jpg');
        form.append('professionalCertifications', fs.createReadStream(dummyPdfPath), 'cert1.pdf');

        const response = await axios.post('http://localhost:5000/api/enhanced-registration/submit', form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 30000
        });

        console.log('✅ Registration API Test Success!');
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        // Clean up test files
        if (fs.existsSync(dummyImagePath)) {
            fs.unlinkSync(dummyImagePath);
        }
        if (fs.existsSync(dummyPdfPath)) {
            fs.unlinkSync(dummyPdfPath);
        }

    } catch (error) {
        console.error('❌ Registration API Test Failed!');
        console.error('Error Status:', error.response?.status);
        console.error('Error Message:', error.message);
        console.error('Error Response:', error.response?.data);

        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Make sure the backend server is running on http://localhost:5000');
        }
    }
}

testRegistrationAPI();
// Test with actual API response format
const testRawApiResponse = {
    spa_id: 42,
    spa_name: 'sumith nawagamuwa',
    owner_name: 'SUMITH Nawagmuwa',
    // These are the actual JSON strings returned by the API
    form1_certificate_path: '["uploads\\\\spas\\\\form1\\\\form1Certificate-1760173923535-811789730.pdf"]',
    nic_front_path: '["uploads\\\\spas\\\\nic\\\\nicFront-1760173923473-209931025.jpg"]',
    nic_back_path: '["uploads\\\\spas\\\\nic\\\\nicBack-1760173923498-375879924.jpg"]',
    br_attachment_path: '["uploads\\\\spas\\\\business\\\\brAttachment-1760173923521-487840553.pdf"]',
    other_document_path: '["uploads\\\\spas\\\\misc\\\\otherDocument-1760173923545-727737845.jpg"]',
    spa_banner_photos_path: '["uploads\\\\spas\\\\banners\\\\spaPhotosBanner-1760173923539-954270396.jpg"]'
};

console.log('=== TESTING WITH REAL API DATA FORMAT ===\n');

// Enhanced JSON parsing function
const parseJsonField = (field) => {
    if (!field) return null;

    // Handle string representations of JSON
    if (typeof field === 'string') {
        try {
            // Try to parse as JSON
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0]; // Return first file path
            }
            return field; // Return as is if not JSON array
        } catch (e) {
            // If parsing fails, it might be a plain string
            return field;
        }
    }

    // Handle array directly
    if (Array.isArray(field) && field.length > 0) {
        return field[0];
    }

    return field; // Return as is for other types
};

// Test the parsing
console.log('Raw form1_certificate_path:', testRawApiResponse.form1_certificate_path);
console.log('Parsed form1_certificate_path:', parseJsonField(testRawApiResponse.form1_certificate_path));

console.log('\nRaw nic_front_path:', testRawApiResponse.nic_front_path);
console.log('Parsed nic_front_path:', parseJsonField(testRawApiResponse.nic_front_path));

// Process the full object
const processedData = {
    ...testRawApiResponse,
    form1_certificate_path: parseJsonField(testRawApiResponse.form1_certificate_path),
    nic_front_path: parseJsonField(testRawApiResponse.nic_front_path),
    nic_back_path: parseJsonField(testRawApiResponse.nic_back_path),
    br_attachment_path: parseJsonField(testRawApiResponse.br_attachment_path),
    other_document_path: parseJsonField(testRawApiResponse.other_document_path),
    spa_banner_photos_path: parseJsonField(testRawApiResponse.spa_banner_photos_path)
};

console.log('\n=== PROCESSED DOCUMENT PATHS ===');
console.log('Form 1 Certificate:', processedData.form1_certificate_path);
console.log('NIC Front:', processedData.nic_front_path);
console.log('NIC Back:', processedData.nic_back_path);
console.log('BR Attachment:', processedData.br_attachment_path);
console.log('Other Documents:', processedData.other_document_path);
console.log('Spa Banner Photos:', processedData.spa_banner_photos_path);

console.log('\n=== UI DOCUMENT CHECK ===');
const documents = [
    { key: 'certificate', label: 'Main Certificate', path: processedData.certificate_path },
    { key: 'form1_certificate', label: 'Form 1 Certificate', path: processedData.form1_certificate_path },
    { key: 'nic_front', label: 'NIC Front', path: processedData.nic_front_path },
    { key: 'nic_back', label: 'NIC Back', path: processedData.nic_back_path },
    { key: 'br_attachment', label: 'Business Registration', path: processedData.br_attachment_path },
    { key: 'other_document', label: 'Other Documents', path: processedData.other_document_path }
];

documents.forEach(doc => {
    console.log(`${doc.label}: ${doc.path ? 'AVAILABLE ✓' : 'NOT AVAILABLE ✗'}`);
});

const availableDocsCount = documents.filter(doc => doc.path).length;
console.log(`\nTotal available documents: ${availableDocsCount}/6`);
console.log(`UI should show: ${availableDocsCount > 0 ? 'View/Download buttons ENABLED' : 'No documents message'}`);
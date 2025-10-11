// Test the frontend JSON parsing logic with the exact data format
console.log('=== FRONTEND JSON PARSING TEST ===\n');

// Simulate the exact JSON parsing logic from the frontend
const parseJsonField = (field) => {
    if (!field) return null;

    // Handle string representations of JSON arrays
    if (typeof field === 'string') {
        try {
            // Try to parse as JSON
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Clean up the path by replacing all backslashes with forward slashes
                let cleanPath = parsed[0].replace(/\\/g, '/');
                // Ensure the path starts with a forward slash for proper URL construction
                if (!cleanPath.startsWith('/')) {
                    cleanPath = '/' + cleanPath;
                }
                return cleanPath;
            }
            return field;
        } catch (e) {
            // If parsing fails, treat as regular string path
            let cleanPath = field.replace(/\\/g, '/');
            if (!cleanPath.startsWith('/')) {
                cleanPath = '/' + cleanPath;
            }
            return cleanPath;
        }
    }

    // Handle array directly
    if (Array.isArray(field) && field.length > 0) {
        let cleanPath = field[0].replace(/\\/g, '/');
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }
        return cleanPath;
    }

    return field;
};

// Test with real data from database
const testData = {
    spa_id: 42,
    spa_name: 'sumith nawagamuwa',
    owner_name: 'SUMITH Nawagmuwa',
    // Raw JSON strings from database
    form1_certificate_path: '["uploads\\\\spas\\\\form1\\\\form1Certificate-1760173923535-811789730.pdf"]',
    nic_front_path: '["uploads\\\\spas\\\\nic\\\\nicFront-1760173923473-209931025.jpg"]',
    nic_back_path: '["uploads\\\\spas\\\\nic\\\\nicBack-1760173923498-375879924.jpg"]',
    br_attachment_path: '["uploads\\\\spas\\\\business\\\\brAttachment-1760173923521-487840553.pdf"]',
    other_document_path: '["uploads\\\\spas\\\\misc\\\\otherDocument-1760173923545-727737845.jpg"]',
    spa_banner_photos_path: '["uploads\\\\spas\\\\banners\\\\spaPhotosBanner-1760173923539-954270396.jpg"]'
};

console.log('Raw field example:', testData.form1_certificate_path);
console.log('Parsed result:', parseJsonField(testData.form1_certificate_path));

// Process the full object (as frontend does)
const processedData = {
    ...testData,
    form1_certificate_path: parseJsonField(testData.form1_certificate_path),
    nic_front_path: parseJsonField(testData.nic_front_path),
    nic_back_path: parseJsonField(testData.nic_back_path),
    br_attachment_path: parseJsonField(testData.br_attachment_path),
    other_document_path: parseJsonField(testData.other_document_path),
    spa_banner_photos_path: parseJsonField(testData.spa_banner_photos_path)
};

console.log('\n=== PROCESSED DOCUMENT PATHS (Frontend Ready) ===');
console.log('✓ Form 1 Certificate:', processedData.form1_certificate_path);
console.log('✓ NIC Front:', processedData.nic_front_path);
console.log('✓ NIC Back:', processedData.nic_back_path);
console.log('✓ Business Registration:', processedData.br_attachment_path);
console.log('✓ Other Documents:', processedData.other_document_path);
console.log('✓ Spa Banner Photos:', processedData.spa_banner_photos_path);

// Test document availability check (as used in the UI)
const documents = [
    { key: 'certificate', label: 'Main Certificate', path: processedData.certificate_path },
    { key: 'form1_certificate', label: 'Form 1 Certificate', path: processedData.form1_certificate_path },
    { key: 'nic_front', label: 'NIC Front', path: processedData.nic_front_path },
    { key: 'nic_back', label: 'NIC Back', path: processedData.nic_back_path },
    { key: 'br_attachment', label: 'Business Registration', path: processedData.br_attachment_path },
    { key: 'other_document', label: 'Other Documents', path: processedData.other_document_path }
];

console.log('\n=== UI DOCUMENT STATUS ===');
documents.forEach(doc => {
    const status = doc.path ? '✅ AVAILABLE (View/Download buttons enabled)' : '❌ NOT AVAILABLE';
    console.log(`${doc.label}: ${status}`);
    if (doc.path) {
        console.log(`   View URL: http://localhost:3001${doc.path}`);
        console.log(`   Download URL: http://localhost:3001${doc.path}`);
    }
});

const availableCount = documents.filter(doc => doc.path).length;
console.log(`\n📊 Total available documents: ${availableCount}/6`);

if (availableCount > 0) {
    console.log('🎉 SUCCESS! Frontend should display document View/Download buttons!');
    console.log('💡 The spa details modal should show available documents with functional buttons.');
} else {
    console.log('❌ No documents available - UI will show "No documents uploaded"');
}
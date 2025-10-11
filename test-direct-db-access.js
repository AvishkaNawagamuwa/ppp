// Test direct database access with proper JSON parsing for Sumith's spa
const mysql = require('mysql2/promise');

async function testDirectDatabaseAccess() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('=== DIRECT DATABASE TEST FOR SUMITH SPA ===\n');

        // Query with proper field selection (matching the SpaModel query)
        const query = `
            SELECT 
                id as spa_id,
                name as spa_name,
                CONCAT(COALESCE(owner_fname, ''), ' ', COALESCE(owner_lname, '')) as owner_name,
                email,
                phone,
                address,
                reference_number,
                status,
                verification_status,
                payment_status,
                annual_payment_status,
                payment_method,
                next_payment_date,
                blacklist_reason,
                certificate_path,
                form1_certificate_path,
                spa_banner_photos_path,
                nic_front_path,
                nic_back_path,
                br_attachment_path,
                other_document_path,
                created_at,
                updated_at
            FROM spas 
            WHERE id = 42
        `;

        const [rows] = await connection.execute(query);

        if (rows.length > 0) {
            const spa = rows[0];

            // Apply JSON parsing (same as frontend logic)
            const parseJsonField = (field) => {
                if (!field) return null;

                if (typeof field === 'string') {
                    try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            let cleanPath = parsed[0].replace(/\\\\/g, '/');
                            if (!cleanPath.startsWith('/')) {
                                cleanPath = '/' + cleanPath;
                            }
                            return cleanPath;
                        }
                        return field;
                    } catch (e) {
                        let cleanPath = field.replace(/\\\\/g, '/');
                        if (!cleanPath.startsWith('/')) {
                            cleanPath = '/' + cleanPath;
                        }
                        return cleanPath;
                    }
                }

                if (Array.isArray(field) && field.length > 0) {
                    let cleanPath = field[0].replace(/\\\\/g, '/');
                    if (!cleanPath.startsWith('/')) {
                        cleanPath = '/' + cleanPath;
                    }
                    return cleanPath;
                }

                return field;
            };

            const processedSpa = {
                ...spa,
                form1_certificate_path: parseJsonField(spa.form1_certificate_path),
                nic_front_path: parseJsonField(spa.nic_front_path),
                nic_back_path: parseJsonField(spa.nic_back_path),
                br_attachment_path: parseJsonField(spa.br_attachment_path),
                other_document_path: parseJsonField(spa.other_document_path),
                spa_banner_photos_path: parseJsonField(spa.spa_banner_photos_path)
            };

            console.log('SUMITH SPA DATA:');
            console.log('ID:', processedSpa.spa_id);
            console.log('Name:', processedSpa.spa_name);
            console.log('Owner:', processedSpa.owner_name);
            console.log('Email:', processedSpa.email);
            console.log('Status:', processedSpa.status);
            console.log('Verification:', processedSpa.verification_status);

            console.log('\n=== PROCESSED DOCUMENT PATHS ===');
            console.log('✓ Main Certificate:', processedSpa.certificate_path || 'NULL');
            console.log('✓ Form 1 Certificate:', processedSpa.form1_certificate_path || 'NULL');
            console.log('✓ NIC Front:', processedSpa.nic_front_path || 'NULL');
            console.log('✓ NIC Back:', processedSpa.nic_back_path || 'NULL');
            console.log('✓ Business Registration:', processedSpa.br_attachment_path || 'NULL');
            console.log('✓ Other Documents:', processedSpa.other_document_path || 'NULL');
            console.log('✓ Spa Banner Photos:', processedSpa.spa_banner_photos_path || 'NULL');

            const availableDocs = [
                processedSpa.form1_certificate_path,
                processedSpa.nic_front_path,
                processedSpa.nic_back_path,
                processedSpa.br_attachment_path,
                processedSpa.other_document_path,
                processedSpa.spa_banner_photos_path
            ].filter(Boolean);

            console.log('\n=== DOCUMENT AVAILABILITY ===');
            console.log(`Available documents: ${availableDocs.length}/6`);

            if (availableDocs.length > 0) {
                console.log('\n=== SAMPLE URLs FOR TESTING ===');
                availableDocs.forEach((path, index) => {
                    const fileName = path.split('/').pop();
                    console.log(`${index + 1}. View: http://localhost:3001${path}`);
                    console.log(`   Download: http://localhost:3001${path} (as ${fileName})`);
                });

                console.log('\n🎉 SUCCESS! Documents are available and paths are properly formatted!');
                console.log('💡 The frontend should now display View/Download buttons for these documents.');
            } else {
                console.log('\n❌ No documents found after processing.');
            }
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Database Error:', error.message);
    }
}

testDirectDatabaseAccess();
const mysql = require('mysql2/promise');

const testDocumentParsing = async () => {
    try {
        // Database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('Testing document parsing for spa ID 29...');

        // Get spa data
        const [rows] = await connection.execute(
            'SELECT id, spa_name, form1_certificate_path, nic_front_path, nic_back_path, br_attachment_path, other_document_path FROM spas WHERE id = 29'
        );

        if (rows.length === 0) {
            console.log('No spa found with ID 29');
            return;
        }

        const spa = rows[0];
        console.log('\nSpa Name:', spa.spa_name);
        console.log('\nOriginal document paths:');

        const documentFields = [
            'form1_certificate_path',
            'nic_front_path',
            'nic_back_path',
            'br_attachment_path',
            'other_document_path'
        ];

        documentFields.forEach(field => {
            console.log(`${field}:`, spa[field]);
        });

        console.log('\nParsed document paths:');

        // Helper function to parse document paths
        const getDocumentPath = (docPath) => {
            if (!docPath) return null;
            if (typeof docPath === 'string') {
                try {
                    const parsed = JSON.parse(docPath);
                    return Array.isArray(parsed) ? parsed[0] : parsed;
                } catch {
                    return docPath;
                }
            }
            return Array.isArray(docPath) ? docPath[0] : docPath;
        };

        documentFields.forEach(field => {
            const parsedPath = getDocumentPath(spa[field]);
            if (parsedPath) {
                console.log(`${field}: ${parsedPath}`);
                console.log(`Full URL: http://localhost:5000/${parsedPath}`);
            }
        });

        await connection.end();

    } catch (error) {
        console.error('Error testing document parsing:', error);
    }
};

testDocumentParsing();
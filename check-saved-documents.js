const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function checkSavedDocuments() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check the latest spa records to see what document paths are saved
        console.log('\n=== LATEST SPA RECORDS WITH DOCUMENT PATHS ===');
        const [spas] = await connection.execute(`
            SELECT 
                id, name, email, status,
                form1_certificate_path,
                spa_banner_photos_path, 
                certificate_path,
                created_at
            FROM spas 
            ORDER BY id DESC 
            LIMIT 5
        `);

        if (spas.length > 0) {
            spas.forEach(spa => {
                console.log(`\n📋 Spa ID: ${spa.id} - ${spa.name} (${spa.email})`);
                console.log(`   Status: ${spa.status}`);
                console.log(`   Form1 Certificate: ${spa.form1_certificate_path || 'NOT SAVED'}`);
                console.log(`   Spa Banner: ${spa.spa_banner_photos_path || 'NOT SAVED'}`);
                console.log(`   BR Certificate: ${spa.certificate_path || 'NOT SAVED'}`);
                console.log(`   Created: ${spa.created_at}`);
            });
        } else {
            console.log('No spa records found');
        }

        // Check payment records with bank slips
        console.log('\n=== PAYMENT RECORDS WITH BANK SLIPS ===');
        const [payments] = await connection.execute(`
            SELECT 
                p.id, p.spa_id, p.payment_method, p.payment_status,
                p.bank_slip_path, p.reference_number,
                s.name as spa_name
            FROM payments p
            LEFT JOIN spas s ON p.spa_id = s.id
            WHERE p.payment_method = 'bank_transfer'
            ORDER BY p.id DESC 
            LIMIT 5
        `);

        if (payments.length > 0) {
            payments.forEach(payment => {
                console.log(`\n💳 Payment ID: ${payment.id} - ${payment.spa_name}`);
                console.log(`   Reference: ${payment.reference_number}`);
                console.log(`   Status: ${payment.payment_status}`);
                console.log(`   Bank Slip: ${payment.bank_slip_path || 'NOT SAVED'}`);
            });
        } else {
            console.log('No bank transfer payment records found');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

checkSavedDocuments();
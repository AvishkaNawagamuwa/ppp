// Test the spa management endpoints directly

const testSpaEndpoints = async () => {
    console.log('Testing spa management endpoints...');

    try {
        // Test fetch spas
        const spasResponse = await fetch('http://localhost:5000/api/admin-lsa-enhanced/spas');
        const spasData = await spasResponse.json();

        console.log('\n=== SPAS DATA ===');
        console.log('Status:', spasResponse.status);
        console.log('Total spas:', spasData.spas?.length || 0);

        if (spasData.spas && spasData.spas.length > 0) {
            console.log('First spa:', {
                id: spasData.spas[0].id,
                name: spasData.spas[0].name || spasData.spas[0].spa_name,
                status: spasData.spas[0].verification_status || spasData.spas[0].status
            });

            // Test document parsing for first spa
            const spa = spasData.spas[0];
            console.log('\n=== DOCUMENT TEST ===');
            console.log('Raw form1_certificate_path:', spa.form1_certificate_path);

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

            const parsedPath = getDocumentPath(spa.form1_certificate_path);
            console.log('Parsed path:', parsedPath);
            if (parsedPath) {
                console.log('Full URL:', `http://localhost:5000/${parsedPath}`);
            }
        }

        // Test approve endpoint (if there's a spa with pending status)
        const pendingSpa = spasData.spas?.find(spa =>
            (spa.verification_status || spa.status) === 'pending'
        );

        if (pendingSpa) {
            console.log('\n=== ENDPOINT TEST ===');
            console.log(`Testing approve endpoint for spa ID: ${pendingSpa.id}`);

            const approveResponse = await fetch(`http://localhost:5000/api/admin-lsa-enhanced/spas/${pendingSpa.id}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Approve endpoint status:', approveResponse.status);

            if (approveResponse.status === 404) {
                console.log('❌ Approve endpoint not found - check route mounting');
            } else {
                const approveData = await approveResponse.json();
                console.log('Approve response:', approveData);
            }
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Run the test
testSpaEndpoints();
const express = require('express');
const db = require('./config/database');

const app = express();

// Test route for SPA profile
app.get('/test-spa-profile/:spaId', async (req, res) => {
    try {
        console.log('Testing SPA profile route...');
        const spaId = req.params.spaId;
        console.log('SPA ID:', spaId);

        // Get spa profile data from spas table where status = 'verified'
        const [spaResults] = await db.execute(`
            SELECT 
                id,
                name as spa_name,
                CONCAT(owner_fname, ' ', owner_lname) as owner_name,
                email,
                phone,
                address,
                address as district,
                status,
                created_at,
                updated_at
            FROM spas 
            WHERE id = ? AND status = 'verified'
        `, [spaId]);

        console.log('Query results:', spaResults);

        if (spaResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Verified SPA not found'
            });
        }

        const spaProfile = spaResults[0];

        res.json({
            success: true,
            data: spaProfile
        });

    } catch (error) {
        console.error('Get SPA profile error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch SPA profile',
            data: null
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});

// Test the endpoint
setTimeout(async () => {
    try {
        const fetch = require('node-fetch');
        const response = await fetch(`http://localhost:${PORT}/test-spa-profile/1`);
        const data = await response.json();
        console.log('Test result:', JSON.stringify(data, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Test error:', error.message);
        process.exit(1);
    }
}, 2000);
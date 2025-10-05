const express = require('express');
const SpaModel = require('./models/SpaModel');
const TherapistModel = require('./models/TherapistModel');

const app = express();

app.get('/test-spas', async (req, res) => {
    try {
        console.log('Testing SpaModel.getAllSpas...');
        const result = await SpaModel.getAllSpas({ page: 1, limit: 10 });
        console.log('SpaModel result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error in test-spas:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/test-therapists', async (req, res) => {
    try {
        console.log('Testing TherapistModel.getAllTherapists...');
        const result = await TherapistModel.getAllTherapists('pending');
        console.log('TherapistModel result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error in test-therapists:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Test server running on port 3001');
    console.log('Test endpoints:');
    console.log('- http://localhost:3001/test-spas');
    console.log('- http://localhost:3001/test-therapists');
});
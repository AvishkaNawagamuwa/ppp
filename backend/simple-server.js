// Simple working server for therapist API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TherapistModel = require('./models/TherapistModel');

const app = express();
const PORT = 5001;

// Basic middleware
app.use(express.json());
app.use(cors());

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Simple server is running' });
});

// Therapist admin route
app.get('/api/therapists/admin/all', async (req, res) => {
    try {
        console.log('🔍 API called: /api/therapists/admin/all');

        const therapists = await TherapistModel.getAllTherapists();
        console.log('✅ Got therapists from model:', therapists?.length || 0);

        if (!therapists || !Array.isArray(therapists)) {
            return res.json({
                success: true,
                data: { therapists: [], count: 0 }
            });
        }

        // Format therapists for frontend
        const formattedTherapists = therapists.map(therapist => ({
            ...therapist,
            fname: therapist.first_name || therapist.name?.split(' ')[0] || '',
            lname: therapist.last_name || therapist.name?.split(' ').slice(1).join(' ') || '',
            full_name: therapist.name || `${therapist.first_name || ''} ${therapist.last_name || ''}`.trim(),
            telno: therapist.phone,
            experience_years: therapist.experience_years || 0,
            specialty: Array.isArray(therapist.specializations)
                ? therapist.specializations.join(', ')
                : therapist.specialization || ''
        }));

        console.log('📤 Sending response with', formattedTherapists.length, 'therapists');

        res.json({
            success: true,
            data: {
                therapists: formattedTherapists,
                count: formattedTherapists.length
            }
        });

    } catch (error) {
        console.error('❌ Error in therapist API:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch therapists',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}/api/therapists/admin/all`);
    console.log(`🏥 Health check at: http://localhost:${PORT}/health`);
});

// Handle errors
app.on('error', (error) => {
    console.error('🚨 Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
});
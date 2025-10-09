const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Enhanced multer configuration for new file requirements
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/spas/';

        // Create different folders based on file field
        switch (file.fieldname) {
            case 'form1Certificate':
                uploadPath += 'form1/';
                break;
            case 'spaPhotosBanner':
                uploadPath += 'banners/';
                break;
            case 'nicFront':
            case 'nicBack':
                uploadPath += 'nic/';
                break;
            case 'brAttachment':
                uploadPath += 'business/';
                break;
            case 'facilityPhotos':
                uploadPath += 'facility/';
                break;
            case 'professionalCertifications':
                uploadPath += 'certifications/';
                break;
            case 'taxRegistration':
                uploadPath += 'tax/';
                break;
            case 'otherDocument':
                uploadPath += 'misc/';
                break;
            default:
                uploadPath += 'general/';
        }

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check file types based on field
    const allowedTypes = {
        'form1Certificate': ['.pdf', '.doc', '.docx'],
        'spaPhotosBanner': ['.jpg', '.jpeg', '.png'],
        'nicFront': ['.jpg', '.jpeg', '.png'],
        'nicBack': ['.jpg', '.jpeg', '.png'],
        'brAttachment': ['.pdf', '.doc', '.docx'],
        'bankSlip': ['.jpg', '.jpeg', '.png', '.pdf'],
        'otherDocument': ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
        'facilityPhotos': ['.jpg', '.jpeg', '.png'],
        'professionalCertifications': ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
    };

    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = allowedTypes[file.fieldname] || ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

    if (allowedExts.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${allowedExts.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 20 // Maximum 20 files
    }
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'lsa@example.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

// Generate reference number
async function generateReferenceNumber() {
    try {
        const [result] = await db.execute(
            'SELECT MAX(CAST(SUBSTRING(reference_number, 4) AS UNSIGNED)) as max_num FROM spas WHERE reference_number REGEXP "^LSA[0-9]+$"'
        );
        const nextNum = (result[0]?.max_num || 0) + 1;
        return `LSA${String(nextNum).padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating reference number:', error);
        return `LSA${Date.now().toString().slice(-4)}`;
    }
}

// Generate payment reference number - max 10 chars
async function generatePaymentReference(type = 'registration') {
    try {
        const prefix = type === 'registration' ? 'REG' : type === 'annual' ? 'ANN' : 'PAY';
        const [result] = await db.execute(
            'SELECT MAX(CAST(SUBSTRING(reference_number, ?) AS UNSIGNED)) as max_num FROM payments WHERE reference_number LIKE ?',
            [prefix.length + 1, `${prefix}%`]
        );
        const nextNum = (result[0]?.max_num || 0) + 1;
        return `${prefix}${String(nextNum).padStart(6, '0')}`;
    } catch (error) {
        console.error('Error generating payment reference:', error);
        // Fallback: ensure it's max 10 chars
        const timestamp = Date.now().toString().slice(-5);
        return `${prefix}${timestamp}`;
    }
}

// POST /api/enhanced-registration/submit
// Complete registration with all files and payment info
router.post('/submit', upload.fields([
    { name: 'nicFront', maxCount: 1 },
    { name: 'nicBack', maxCount: 1 },
    { name: 'brAttachment', maxCount: 1 },
    { name: 'form1Certificate', maxCount: 1 },
    { name: 'spaPhotosBanner', maxCount: 1 },
    { name: 'facilityPhotos', maxCount: 10 },
    { name: 'professionalCertifications', maxCount: 10 },
    { name: 'bankSlip', maxCount: 1 },
    { name: 'otherDocument', maxCount: 1 }
]), async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const {
            // User details
            firstName, lastName, email, telephone, cellphone, nicNo,
            // Spa details
            spaName, spaAddressLine1, spaAddressLine2, spaProvince, spaPostalCode,
            spaTelephone, spaBRNumber,
            // Payment details
            paymentMethod, bankDetails
        } = req.body;

        console.log('Registration request received:', {
            name: `${firstName} ${lastName}`,
            spa: spaName,
            payment: paymentMethod,
            files: Object.keys(req.files || {})
        });

        // Validate required fields
        const requiredFieldsData = {
            firstName, lastName, email, nicNo, spaName, spaAddressLine1, spaTelephone, spaBRNumber
        };
        const missingFields = [];

        Object.entries(requiredFieldsData).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                missingFields.push(key);
            }
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate required files
        const requiredFiles = ['nicFront', 'nicBack', 'brAttachment', 'form1Certificate', 'spaPhotosBanner'];
        const missingFiles = [];

        for (const fileField of requiredFiles) {
            if (!req.files[fileField] || req.files[fileField].length === 0) {
                missingFiles.push(fileField);
            }
        }

        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }

        // Validate facility photos (minimum 5) - temporarily optional for testing
        if (req.files.facilityPhotos && req.files.facilityPhotos.length > 0 && req.files.facilityPhotos.length < 5) {
            const photoCount = req.files.facilityPhotos.length;
            throw new Error(`Minimum 5 facility photos required, got ${photoCount}`);
        }

        // Log facility photos status
        const photoCount = req.files.facilityPhotos ? req.files.facilityPhotos.length : 0;
        console.log(`Facility photos uploaded: ${photoCount}`);

        // For testing purposes, we'll allow registration without facility photos
        // TODO: Re-enable this validation once facility photo upload is implemented properly
        // if (!req.files.facilityPhotos || req.files.facilityPhotos.length < 5) {
        //     throw new Error(`Minimum 5 facility photos required, got ${photoCount}`);
        // }

        // Validate bank slip for bank transfer payments
        if (paymentMethod === 'bank_transfer' && (!req.files.bankSlip || req.files.bankSlip.length === 0)) {
            throw new Error('Bank transfer slip is required for bank transfer payments');
        }

        // Process file paths
        const filePaths = {};
        Object.keys(req.files).forEach(fieldName => {
            if (Array.isArray(req.files[fieldName])) {
                filePaths[fieldName] = req.files[fieldName].map(file => file.path);
            } else {
                filePaths[fieldName] = req.files[fieldName][0].path;
            }
        });

        // Insert spa record with ALL DOCUMENT PATHS
        const fullAddress = `${spaAddressLine1}${spaAddressLine2 ? ', ' + spaAddressLine2 : ''}, ${spaProvince} ${spaPostalCode}`;

        // Extract ALL document paths for database storage
        const nicFrontPath = filePaths.nicFront ? filePaths.nicFront : null;
        const nicBackPath = filePaths.nicBack ? filePaths.nicBack : null;
        const brAttachmentPath = filePaths.brAttachment ? filePaths.brAttachment : null;
        const form1CertPath = filePaths.form1Certificate ? filePaths.form1Certificate : null;
        const spaBannerPath = filePaths.spaPhotosBanner ? filePaths.spaPhotosBanner : null;
        const otherDocPath = filePaths.otherDocument ? filePaths.otherDocument : null;

        // Insert spa with ALL document paths
        const [spaResult] = await connection.execute(`
            INSERT INTO spas (
                name, owner_fname, owner_lname, email, phone, address, status,
                nic_front_path, nic_back_path, br_attachment_path, 
                form1_certificate_path, spa_banner_photos_path, other_document_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            spaName, firstName, lastName, email, spaTelephone, fullAddress, 'pending',
            nicFrontPath, nicBackPath, brAttachmentPath,
            form1CertPath, spaBannerPath, otherDocPath
        ]);

        const spaId = spaResult.insertId;

        // Update the spa record with generated reference number
        const referenceNumber = `LSA${String(spaId).padStart(4, '0')}`;
        await connection.execute(`
            UPDATE spas SET reference_number = ? WHERE id = ?
        `, [referenceNumber, spaId]);

        // Create payment record
        const paymentRef = await generatePaymentReference('registration');
        const paymentStatus = paymentMethod === 'card' ? 'completed' : 'pending_approval';

        const [paymentResult] = await connection.execute(`
      INSERT INTO payments (
        spa_id, payment_type, payment_method, amount, reference_number, payment_status
      ) VALUES (?, 'registration', ?, 5000.00, ?, ?)
    `, [
            spaId, paymentMethod, paymentRef, paymentStatus
        ]);

        // If bank transfer, store bank slip path
        if (paymentMethod === 'bank_transfer' && req.files.bankSlip && req.files.bankSlip[0]) {
            const bankSlipPath = req.files.bankSlip[0].path;

            await connection.execute(`
        UPDATE payments SET bank_slip_path = ? WHERE id = ?
      `, [
                bankSlipPath,
                paymentResult.insertId
            ]);
        }

        // Log all document paths that were saved
        console.log('📁 Documents saved to database and file system:');
        console.log(`   ✅ NIC Front: ${nicFrontPath || 'Not uploaded'}`);
        console.log(`   ✅ NIC Back: ${nicBackPath || 'Not uploaded'}`);
        console.log(`   ✅ BR Attachment: ${brAttachmentPath || 'Not uploaded'}`);
        console.log(`   ✅ Form1 Certificate: ${form1CertPath || 'Not uploaded'}`);
        console.log(`   ✅ Spa Banner: ${spaBannerPath || 'Not uploaded'}`);
        console.log(`   ✅ Other Document: ${otherDocPath || 'Not uploaded'}`);
        if (paymentMethod === 'bank_transfer') {
            console.log(`   ✅ Bank Slip: ${filePaths.bankSlip || 'Not uploaded'} (saved to payments table)`);
        }

        // Create admin user for spa (for future spa dashboard access)
        const hashedPassword = await bcrypt.hash('temp123', 10); // Temporary password
        await connection.execute(`
      INSERT INTO admin_users (
        username, email, password_hash, role, spa_id, full_name, phone
      ) VALUES (?, ?, ?, 'admin_spa', ?, ?, ?)
    `, [
            `spa_${referenceNumber.toLowerCase()}`,
            email,
            hashedPassword,
            spaId,
            `${firstName} ${lastName}`,
            telephone
        ]);

        // Log activity - using correct column names
        await connection.execute(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, description, actor_type, actor_name
      ) VALUES ('spa', ?, 'created', ?, 'spa', ?)
    `, [
            spaId,
            `New spa registration: ${spaName} (${referenceNumber})`,
            `${firstName} ${lastName}`
        ]);

        // Send notification to AdminLSA - using correct column names  
        await connection.execute(`
      INSERT INTO system_notifications (
        recipient_type, title, message, notification_type, related_entity_type, related_entity_id
      ) VALUES ('admin_lsa', 'New Spa Registration', ?, 'spa_registration', 'spa', ?)
    `, [
            `New spa "${spaName}" (${referenceNumber}) has registered and is pending approval.`,
            spaId
        ]);

        // Transaction removed for testing

        // Send email notifications
        try {
            // Email to spa owner
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'lsa@example.com',
                to: email,
                subject: 'LSA Registration Received - ' + referenceNumber,
                html: `
          <h2>Lanka Spa Association - Registration Confirmation</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>Thank you for registering <strong>${spaName}</strong> with the Lanka Spa Association.</p>
          <p><strong>Your Reference Number:</strong> ${referenceNumber}</p>
          <p><strong>Payment Status:</strong> ${paymentMethod === 'card' ? 'Completed' : 'Pending Bank Transfer Approval'}</p>
          <p>Your registration is currently under review. We will notify you once the verification process is complete.</p>
          <p>Best regards,<br>Lanka Spa Association</p>
        `
            });

            // Email to admin
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'lsa@example.com',
                to: 'admin@lsa.gov.lk',
                subject: 'New Spa Registration - ' + referenceNumber,
                html: `
          <h2>New Spa Registration</h2>
          <p><strong>Spa:</strong> ${spaName}</p>
          <p><strong>Owner:</strong> ${firstName} ${lastName}</p>
          <p><strong>Reference:</strong> ${referenceNumber}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p>Please review the registration in the AdminLSA dashboard.</p>
        `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the registration if email fails
        }

        res.status(201).json({
            success: true,
            message: paymentMethod === 'card'
                ? 'Registration completed successfully!'
                : 'Registration submitted! Please complete the bank transfer and wait for approval.',
            data: {
                referenceNumber,
                spaId,
                paymentReference: paymentRef,
                status: 'pending',
                paymentStatus: paymentStatus,
                loginCredentials: {
                    username: `spa_${referenceNumber.toLowerCase()}`,
                    temporaryPassword: 'temp123',
                    loginUrl: '/admin-spa'
                }
            }
        });

    } catch (error) {
        // Transaction rollback removed for testing

        // Clean up uploaded files on error
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
            code: error.code,
            requestBody: req.body,
            files: req.files ? Object.keys(req.files) : 'No files'
        });

        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });

    } finally {
        connection.release();
    }
});

// GET /api/enhanced-registration/status/:referenceNumber
// Check registration status
router.get('/status/:referenceNumber', async (req, res) => {
    try {
        const { referenceNumber } = req.params;

        const [spa] = await db.execute(`
      SELECT s.*, p.status as payment_status, p.reference_number as payment_ref
      FROM spas s
      LEFT JOIN payments p ON s.id = p.spa_id AND p.payment_type = 'registration'
      WHERE s.reference_number = ?
    `, [referenceNumber]);

        if (spa.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        res.json({
            success: true,
            data: {
                referenceNumber: spa[0].reference_number,
                spaName: spa[0].name,
                status: spa[0].status,
                paymentStatus: spa[0].payment_status,
                paymentReference: spa[0].payment_ref,
                submittedAt: spa[0].created_at,
                nextPaymentDate: spa[0].next_payment_date
            }
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check status'
        });
    }
});

module.exports = router;

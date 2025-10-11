const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/NotificationModel');
const ActivityLogModel = require('../models/ActivityLogModel');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Middleware to verify AdminSPA authentication
const verifyAdminSPA = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

        // Verify user exists and is AdminSPA
        const [user] = await db.execute(
            'SELECT * FROM admin_users WHERE id = ? AND role = "admin_spa" AND is_active = 1',
            [decoded.id]
        );

        if (user.length === 0) {
            return res.status(403).json({ success: false, error: 'Access denied. AdminSPA role required.' });
        }

        req.user = user[0];
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token.' });
    }
};

// Check payment status and overdue
router.get('/payment-status', verifyAdminSPA, async (req, res) => {
    try {
        if (!req.user.spa_id) {
            return res.status(400).json({ success: false, error: 'No spa associated with this account' });
        }

        const [spa] = await db.execute(`
      SELECT 
        s.*,
        p.status as payment_status,
        p.next_payment_date,
        p.payment_method,
        CASE 
          WHEN s.next_payment_date < CURDATE() AND s.payment_status != 'paid' THEN true
          ELSE false
        END as is_overdue
      FROM spas s
      LEFT JOIN payments p ON s.id = p.spa_id AND p.payment_type = 'annual'
      WHERE s.id = ?
      ORDER BY p.created_at DESC
      LIMIT 1
    `, [req.user.spa_id]);

        if (spa.length === 0) {
            return res.status(404).json({ success: false, error: 'Spa not found' });
        }

        const spaData = spa[0];

        res.json({
            success: true,
            data: {
                spa_id: spaData.id,
                spa_name: spaData.name,
                reference_number: spaData.reference_number,
                status: spaData.status,
                payment_status: spaData.payment_status,
                next_payment_date: spaData.next_payment_date,
                is_overdue: spaData.is_overdue,
                access_restricted: spaData.is_overdue,
                payment_method: spaData.payment_method
            }
        });

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ success: false, error: 'Failed to check payment status' });
    }
});

// Get payment plans with enhanced options
router.get('/payment-plans', verifyAdminSPA, async (req, res) => {
    try {
        const plans = [
            {
                id: 'monthly',
                name: 'Monthly',
                price: 5000,
                currency: 'LKR',
                duration: '1 Month',
                description: 'Perfect for startups',
                features: [
                    'Unlimited Therapist Management',
                    'Basic Analytics',
                    'Email Support',
                    'Mobile App Access',
                    'Standard Processing'
                ],
                popular: false
            },
            {
                id: 'quarterly',
                name: 'Quarterly',
                price: 14000,
                currency: 'LKR',
                duration: '3 Months',
                description: 'Balanced growth solution',
                original_price: 15000,
                savings: 1000,
                features: [
                    'Everything in Monthly',
                    'Advanced Analytics',
                    'Priority Support',
                    'Bulk Operations',
                    'Custom Reports'
                ],
                popular: false
            },
            {
                id: 'half-yearly',
                name: 'Half-Yearly',
                price: 25000,
                currency: 'LKR',
                duration: '6 Months',
                description: 'Seasonal growth boost',
                original_price: 30000,
                savings: 5000,
                features: [
                    'Everything in Quarterly',
                    'Advanced Integrations',
                    'Dedicated Support',
                    'API Access',
                    'Training Sessions'
                ],
                popular: false
            },
            {
                id: 'annual',
                name: 'Annual',
                price: 45000,
                currency: 'LKR',
                duration: '12 Months',
                description: 'Best value with premium features',
                original_price: 60000,
                savings: 15000,
                discount_percentage: 25,
                features: [
                    'Everything in Half-Yearly',
                    'Premium Analytics Dashboard',
                    '24/7 Priority Support',
                    'White-label Options',
                    'Advanced Automation',
                    'Compliance Tools'
                ],
                popular: true,
                badge: 'MOST POPULAR'
            }
        ];

        res.json({
            success: true,
            data: plans
        });

    } catch (error) {
        console.error('Error fetching payment plans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payment plans' });
    }
});

// Process payment (enhanced with card and bank transfer)
router.post('/process-payment', verifyAdminSPA, async (req, res) => {
    try {
        const { plan_id, payment_method, card_details, bank_details } = req.body;

        if (!req.user.spa_id) {
            return res.status(400).json({ success: false, error: 'No spa associated with this account' });
        }

        // Validate payment method
        if (!['card', 'bank_transfer'].includes(payment_method)) {
            return res.status(400).json({ success: false, error: 'Invalid payment method' });
        }

        // Get plan details
        const planPrices = {
            'monthly': { amount: 5000, duration_months: 1, type: 'monthly' },
            'quarterly': { amount: 14000, duration_months: 3, type: 'quarterly' },
            'half-yearly': { amount: 25000, duration_months: 6, type: 'annual' },
            'annual': { amount: 45000, duration_months: 12, type: 'annual' }
        };

        const plan = planPrices[plan_id];
        if (!plan) {
            return res.status(400).json({ success: false, error: 'Invalid plan selected' });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Create payment record
            const [paymentResult] = await connection.execute(`
        INSERT INTO payments (
          spa_id, payment_type, payment_method, amount, status,
          bank_transfer_approved
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
                req.user.spa_id,
                plan.type,
                payment_method,
                plan.amount,
                payment_method === 'card' ? 'completed' : 'pending',
                payment_method === 'card' ? true : false
            ]);

            const paymentId = paymentResult.insertId;

            if (payment_method === 'card') {
                // For card payments, update spa payment status immediately
                const nextPaymentDate = new Date();
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + plan.duration_months);

                await connection.execute(`
          UPDATE spas SET 
            payment_status = 'paid',
            next_payment_date = ?,
            annual_fee_paid = true
          WHERE id = ?
        `, [nextPaymentDate, req.user.spa_id]);

                await connection.commit();

                res.json({
                    success: true,
                    message: 'Payment processed successfully!',
                    data: {
                        payment_id: paymentId,
                        status: 'completed',
                        amount: plan.amount,
                        next_payment_date: nextPaymentDate,
                        access_restored: true
                    }
                });

            } else {
                // For bank transfer, create pending payment
                await connection.execute(`
          UPDATE payments SET 
            bank_slip_path = ?,
            created_at = NOW()
          WHERE id = ?
        `, [bank_details?.reference || null, paymentId]);

                await connection.commit();

                res.json({
                    success: true,
                    message: 'Bank transfer payment submitted. Awaiting LSA approval.',
                    data: {
                        payment_id: paymentId,
                        status: 'pending_approval',
                        amount: plan.amount,
                        bank_details: {
                            bank_name: 'Bank of Ceylon',
                            account_name: 'Lanka Spa Association',
                            account_number: '123-456-789-001',
                            branch: 'Colombo Main Branch',
                            reference: `SPA${req.user.spa_id}_${paymentId}`
                        },
                        instructions: [
                            'Transfer the exact amount to the provided bank account',
                            'Use the reference number in the transfer description',
                            'Keep your bank slip for records',
                            'Payment verification usually takes 1-2 business days',
                            'You will receive email confirmation once approved'
                        ]
                    }
                });
            }

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, error: 'Failed to process payment' });
    }
});

// Get payment history
router.get('/payment-history', verifyAdminSPA, async (req, res) => {
    try {
        if (!req.user.spa_id) {
            return res.status(400).json({ success: false, error: 'No spa associated with this account' });
        }

        const [payments] = await db.execute(`
      SELECT 
        id,
        payment_type,
        payment_method,
        amount,
        status,
        bank_transfer_approved,
        approval_date,
        approved_by,
        created_at,
        reference_number
      FROM payments
      WHERE spa_id = ?
      ORDER BY created_at DESC
    `, [req.user.spa_id]);

        res.json({
            success: true,
            data: payments
        });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
    }
});

// Request annual payment approval (for bank transfers)
router.post('/request-annual-payment-approval', verifyAdminSPA, async (req, res) => {
    try {
        const { payment_id, bank_slip_reference } = req.body;

        if (!req.user.spa_id) {
            return res.status(400).json({ success: false, error: 'No spa associated with this account' });
        }

        // Update payment with bank slip reference
        const [result] = await db.execute(`
      UPDATE payments SET 
        bank_slip_path = ?,
        updated_at = NOW()
      WHERE id = ? AND spa_id = ? AND payment_method = 'bank_transfer'
    `, [bank_slip_reference, payment_id, req.user.spa_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Create notification for AdminLSA
        await db.execute(`
      INSERT INTO system_notifications (
        recipient_type, title, message, type, related_entity_type, related_entity_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
            'lsa',
            'New Bank Transfer Payment Approval Request',
            `Spa ${req.user.spa_id} has submitted annual payment via bank transfer for approval`,
            'info',
            'payment',
            payment_id
        ]);

        res.json({
            success: true,
            message: 'Annual payment approval request submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting payment approval request:', error);
        res.status(500).json({ success: false, error: 'Failed to submit approval request' });
    }
});

// Get spa dashboard stats
router.get('/dashboard/stats', verifyAdminSPA, async (req, res) => {
    try {
        if (!req.user.spa_id) {
            return res.status(400).json({ success: false, error: 'No spa associated with this account' });
        }

        const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status = 'approved') as approved_therapists,
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status = 'pending') as pending_therapists,
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status = 'rejected') as rejected_therapists,
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status IN ('resigned', 'terminated')) as inactive_therapists
    `, [req.user.spa_id, req.user.spa_id, req.user.spa_id, req.user.spa_id]);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Error fetching spa dashboard stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

// Check access restrictions based on payment status
router.get('/access-check', verifyAdminSPA, async (req, res) => {
    try {
        if (!req.user.spa_id) {
            return res.status(400).json({ success: false, error: 'No spa associated with this account' });
        }

        const [spa] = await db.execute(`
      SELECT 
        next_payment_date,
        payment_status,
        CASE 
          WHEN next_payment_date < CURDATE() AND payment_status != 'paid' THEN true
          ELSE false
        END as is_overdue
      FROM spas
      WHERE id = ?
    `, [req.user.spa_id]);

        if (spa.length === 0) {
            return res.status(404).json({ success: false, error: 'Spa not found' });
        }

        const spaData = spa[0];
        const isOverdue = spaData.is_overdue;

        res.json({
            success: true,
            data: {
                access_allowed: !isOverdue,
                is_overdue: isOverdue,
                payment_status: spaData.payment_status,
                next_payment_date: spaData.next_payment_date,
                restricted_message: isOverdue ? 'Payment is overdue. Please complete payment to restore full access.' : null,
                allowed_sections: isOverdue ? ['payment'] : ['dashboard', 'therapists', 'payment', 'profile', 'settings']
            }
        });

    } catch (error) {
        console.error('Error checking access:', error);
        res.status(500).json({ success: false, error: 'Failed to check access' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Authentication middleware for AdminSPA
const authenticateAdminSPA = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const [user] = await db.execute(
            'SELECT * FROM admin_users WHERE id = ? AND role = "admin_spa" AND is_active = true',
            [decoded.id]
        );

        if (user.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        req.user = user[0];
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// GET /api/admin-spa/status
// Check spa payment status and overdue payments
router.get('/status', authenticateAdminSPA, async (req, res) => {
    try {
        const [spa] = await db.execute(`
      SELECT 
        s.*,
        p.status as last_payment_status,
        p.payment_type as last_payment_type,
        p.created_at as last_payment_date
      FROM spas s
      LEFT JOIN payments p ON s.id = p.spa_id
      WHERE s.id = ?
      ORDER BY p.created_at DESC
      LIMIT 1
    `, [req.user.spa_id]);

        if (spa.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Spa not found'
            });
        }

        const spaData = spa[0];
        const currentDate = new Date();
        const nextPaymentDate = new Date(spaData.next_payment_date);
        const isOverdue = currentDate > nextPaymentDate;

        // Calculate days overdue or days remaining
        const diffTime = nextPaymentDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                spaId: spaData.id,
                spaName: spaData.name,
                referenceNumber: spaData.reference_number,
                status: spaData.status,
                paymentStatus: spaData.payment_status,
                nextPaymentDate: spaData.next_payment_date,
                isOverdue,
                daysOverdue: isOverdue ? Math.abs(diffDays) : 0,
                daysRemaining: !isOverdue ? diffDays : 0,
                lastPayment: {
                    status: spaData.last_payment_status,
                    type: spaData.last_payment_type,
                    date: spaData.last_payment_date
                }
            }
        });

    } catch (error) {
        console.error('Spa status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch spa status'
        });
    }
});

// GET /api/admin-spa/payment-plans
// Get available payment plans
router.get('/payment-plans', authenticateAdminSPA, async (req, res) => {
    try {
        const plans = [
            {
                id: 'monthly',
                name: 'Monthly',
                price: 5000,
                duration: 1,
                durationType: 'month',
                description: 'Perfect for startups',
                features: [
                    'Unlimited Therapist Management',
                    'Basic Analytics',
                    'Email Support',
                    'Mobile App Access',
                    'Standard Processing'
                ]
            },
            {
                id: 'quarterly',
                name: 'Quarterly',
                price: 14000,
                originalPrice: 15000,
                savings: 1000,
                duration: 3,
                durationType: 'months',
                description: 'Balanced growth solution',
                features: [
                    'Everything in Monthly',
                    'Advanced Analytics',
                    'Priority Support',
                    'Bulk Operations',
                    'Custom Reports'
                ]
            },
            {
                id: 'half-yearly',
                name: 'Half-Yearly',
                price: 25000,
                originalPrice: 30000,
                savings: 5000,
                duration: 6,
                durationType: 'months',
                description: 'Seasonal growth boost',
                features: [
                    'Everything in Quarterly',
                    'Advanced Integrations',
                    'Dedicated Support',
                    'API Access',
                    'Training Sessions'
                ]
            },
            {
                id: 'annual',
                name: 'Annual',
                price: 45000,
                originalPrice: 60000,
                savings: 15000,
                duration: 12,
                durationType: 'months',
                description: 'Best value with premium features',
                popular: true,
                features: [
                    'Everything in Half-Yearly',
                    'Premium Analytics Dashboard',
                    '24/7 Priority Support',
                    'White-label Options',
                    'Advanced Automation',
                    'Compliance Tools'
                ]
            }
        ];

        res.json({
            success: true,
            data: plans
        });

    } catch (error) {
        console.error('Payment plans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment plans'
        });
    }
});

// POST /api/admin-spa/payment/initiate
// Initiate payment (card or bank transfer)
router.post('/payment/initiate', authenticateAdminSPA, async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { planId, paymentMethod, bankDetails } = req.body;

        if (!planId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'Plan ID and payment method are required'
            });
        }

        // Get plan details (this would normally come from a plans table)
        const planPrices = {
            monthly: 5000,
            quarterly: 14000,
            'half-yearly': 25000,
            annual: 45000
        };

        const planDurations = {
            monthly: 1,
            quarterly: 3,
            'half-yearly': 6,
            annual: 12
        };

        const amount = planPrices[planId];
        const durationMonths = planDurations[planId];

        if (!amount) {
            return res.status(400).json({
                success: false,
                error: 'Invalid plan selected'
            });
        }

        // Generate payment reference
        const paymentRef = `ANN${Date.now().toString().slice(-6)}`;

        // Create payment record
        const paymentStatus = paymentMethod === 'card' ? 'completed' : 'pending';
        const [paymentResult] = await connection.execute(`
      INSERT INTO payments (
        spa_id, payment_type, payment_method, amount, status, reference_number,
        bank_transfer_approved, created_at
      ) VALUES (?, 'annual', ?, ?, ?, ?, ?, NOW())
    `, [
            req.user.spa_id,
            paymentMethod,
            amount,
            paymentStatus,
            paymentRef,
            paymentMethod === 'bank_transfer' ? false : null
        ]);

        // If card payment, update spa payment status and next payment date
        if (paymentMethod === 'card') {
            const nextPaymentDate = new Date();
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + durationMonths);

            await connection.execute(`
        UPDATE spas SET 
          payment_status = 'paid',
          next_payment_date = ?,
          annual_fee_paid = true
        WHERE id = ?
      `, [nextPaymentDate.toISOString().split('T')[0], req.user.spa_id]);
        } else if (paymentMethod === 'bank_transfer' && bankDetails) {
            // Store bank transfer details for AdminLSA approval
            await connection.execute(`
        UPDATE payments SET 
          bank_slip_path = ?
        WHERE id = ?
      `, [JSON.stringify(bankDetails), paymentResult.insertId]);

            // Notify AdminLSA about pending bank transfer
            await connection.execute(`
        INSERT INTO system_notifications (
          recipient_type, title, message, type, related_entity_type, related_entity_id, created_at
        ) VALUES ('lsa', 'Annual Payment Request', ?, 'info', 'payment', ?, NOW())
      `, [
                `Spa ${req.user.spa_id} has submitted an annual payment request via bank transfer (${paymentRef})`,
                paymentResult.insertId
            ]);
        }

        // Log activity
        await connection.execute(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, description, actor_type, actor_id, actor_name, created_at
      ) VALUES ('payment', ?, 'created', ?, 'spa', ?, ?, NOW())
    `, [
            paymentResult.insertId,
            `${planId} payment initiated (${paymentMethod}): ${paymentRef}`,
            req.user.id,
            req.user.full_name
        ]);

        await connection.commit();

        res.json({
            success: true,
            message: paymentMethod === 'card'
                ? 'Payment completed successfully!'
                : 'Payment request submitted for approval',
            data: {
                paymentId: paymentResult.insertId,
                paymentReference: paymentRef,
                amount,
                status: paymentStatus,
                method: paymentMethod
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Payment initiation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to initiate payment'
        });
    } finally {
        connection.release();
    }
});

// GET /api/admin-spa/payment-history
// Get payment history for the spa
router.get('/payment-history', authenticateAdminSPA, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [payments] = await db.execute(`
      SELECT 
        p.*,
        CASE 
          WHEN p.payment_method = 'bank_transfer' AND p.bank_transfer_approved = false THEN 'pending_approval'
          ELSE p.status
        END as display_status
      FROM payments p
      WHERE p.spa_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.spa_id, parseInt(limit), parseInt(offset)]);

        // Get total count
        const [countResult] = await db.execute(
            'SELECT COUNT(*) as total FROM payments WHERE spa_id = ?',
            [req.user.spa_id]
        );

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment history'
        });
    }
});

// GET /api/admin-spa/dashboard/stats
// Get dashboard statistics for spa
router.get('/dashboard/stats', authenticateAdminSPA, async (req, res) => {
    try {
        const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status = 'approved') as approved_therapists,
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status = 'pending') as pending_therapists,
        (SELECT COUNT(*) FROM therapists WHERE spa_id = ? AND status = 'rejected') as rejected_therapists,
        (SELECT COUNT(*) FROM payments WHERE spa_id = ? AND status = 'completed') as completed_payments,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE spa_id = ? AND status = 'completed') as total_paid
    `, [req.user.spa_id, req.user.spa_id, req.user.spa_id, req.user.spa_id, req.user.spa_id]);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});

module.exports = router;
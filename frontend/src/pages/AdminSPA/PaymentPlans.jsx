import React, { useState, useContext, useEffect } from 'react';
import { FiCheck, FiStar, FiCalendar, FiCreditCard, FiUpload, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { SpaContext } from './SpaContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const PaymentPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bankTransferProof, setBankTransferProof] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [availablePlans, setAvailablePlans] = useState([]);
    const { subscriptionStatus } = useContext(SpaContext);

    const currentDate = new Date('2025-10-03');

    useEffect(() => {
        fetchAvailablePlans();
    }, []);

    const fetchAvailablePlans = async () => {
        try {
            const response = await axios.get('/api/admin-spa-enhanced/payment-plans', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAvailablePlans(response.data.plans || []);
        } catch (error) {
            console.error('Error fetching payment plans:', error);
        }
    };

    const plans = [
        {
            id: 'monthly',
            name: 'Monthly',
            price: 5000,
            durationMonths: 1,
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
            originalPrice: 15000,
            durationMonths: 3,
            duration: '3 Months',
            description: 'Balanced growth solution',
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
            originalPrice: 30000,
            durationMonths: 6,
            duration: '6 Months',
            description: 'Seasonal growth boost',
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
            originalPrice: 60000,
            durationMonths: 12,
            duration: '12 Months',
            description: 'Best value with premium features',
            features: [
                'Everything in Half-Yearly',
                'Premium Analytics Dashboard',
                '24/7 Priority Support',
                'White-label Options',
                'Advanced Automation',
                'Compliance Tools'
            ],
            popular: true,
            savings: '25% OFF'
        }
    ];

    const handleSelectPlan = (planId) => {
        setSelectedPlan(planId);
    };

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);
    };

    const handleBankTransferUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setBankTransferProof(file);
        }
    };

    const processCardPayment = async (planData) => {
        try {
            setPaymentProcessing(true);

            const response = await axios.post('/api/admin-spa-enhanced/process-payment', {
                plan_id: planData.id,
                payment_method: 'card',
                amount: planData.price
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                // Simulate PayHere integration
                Swal.fire({
                    title: 'Payment Successful!',
                    text: `Your ${planData.name} plan has been activated.`,
                    icon: 'success',
                    confirmButtonColor: '#001F3F'
                });
                setShowPaymentModal(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            Swal.fire({
                title: 'Payment Failed',
                text: 'Please try again or contact support.',
                icon: 'error',
                confirmButtonColor: '#001F3F'
            });
        } finally {
            setPaymentProcessing(false);
        }
    };

    const processBankTransfer = async (planData) => {
        if (!bankTransferProof) {
            Swal.fire({
                title: 'Upload Required',
                text: 'Please upload proof of bank transfer.',
                icon: 'warning',
                confirmButtonColor: '#001F3F'
            });
            return;
        }

        const formData = new FormData();
        formData.append('plan_id', planData.id);
        formData.append('payment_method', 'bank_transfer');
        formData.append('amount', planData.price);
        formData.append('transfer_proof', bankTransferProof);

        try {
            setPaymentProcessing(true);

            const response = await axios.post('/api/admin-spa-enhanced/process-payment', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Bank Transfer Submitted',
                    text: 'Your payment is pending approval by LSA Admin.',
                    icon: 'info',
                    confirmButtonColor: '#001F3F'
                });
                setShowPaymentModal(false);
                setBankTransferProof(null);
            }
        } catch (error) {
            console.error('Bank transfer error:', error);
            Swal.fire({
                title: 'Upload Failed',
                text: 'Please try again or contact support.',
                icon: 'error',
                confirmButtonColor: '#001F3F'
            });
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handlePayNow = () => {
        const planData = plans.find(p => p.id === selectedPlan);
        if (!planData) return;

        if (selectedPaymentMethod === 'card') {
            processCardPayment(planData);
        } else {
            processBankTransfer(planData);
        }
    };

    const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    // Calculate next payment date
    const getNextPaymentDate = () => {
        if (!selectedPlanData) return '';
        const nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + selectedPlanData.durationMonths);
        return nextDate.toLocaleDateString('en-GB');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Unlock the full potential of your spa management system. Choose the plan that fits your business needs.
                </p>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${selectedPlan === plan.id
                            ? 'border-[#4A90E2] ring-4 ring-[#4A90E2]/20 scale-105'
                            : 'border-gray-200 hover:border-[#4A90E2]/50'
                            } ${plan.popular ? 'ring-2 ring-[#D4AF37]' : ''}`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <div className="bg-gradient-to-r from-[#D4AF37] to-green-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center">
                                    <FiStar size={12} className="mr-1" />
                                    MOST POPULAR
                                </div>
                            </div>
                        )}

                        {/* Savings Badge */}
                        {plan.savings && (
                            <div className="absolute -top-2 -right-2">
                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {plan.savings}
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            {/* Plan Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                                <div className="mb-4">
                                    <div className="flex items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-800">{formatCurrency(plan.price)}</span>
                                    </div>
                                    {plan.originalPrice && (
                                        <div className="flex items-center justify-center mt-1">
                                            <span className="text-sm text-gray-500 line-through mr-2">
                                                {formatCurrency(plan.originalPrice)}
                                            </span>
                                            <span className="text-sm text-[#D4AF37] font-medium">
                                                Save {formatCurrency(plan.originalPrice - plan.price)}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-gray-500 text-sm">{plan.duration}</p>
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${selectedPlan === plan.id
                                        ? 'bg-[#4A90E2] text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="flex-shrink-0 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center mr-3">
                                            <FiCheck size={12} className="text-white" />
                                        </div>
                                        <span className="text-sm text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Summary Panel */}
            {selectedPlan && (
                <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiCalendar className="mr-2 text-[#D4AF37]" />
                        Selected Plan Summary
                    </h3>
                    <div className="overflow-hidden">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 font-medium text-gray-700">Plan:</td>
                                    <td className="py-3 text-gray-900">{selectedPlanData?.name}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 font-medium text-gray-700">Payment Amount:</td>
                                    <td className="py-3 text-[#0A1428] font-semibold">{formatCurrency(selectedPlanData?.price)}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium text-gray-700">Next Payment Date:</td>
                                    <td className="py-3 text-gray-900">{getNextPaymentDate()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mt-6 border-t pt-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-4">Choose Payment Method</h4>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => handlePaymentMethodChange('card')}
                                className={`p-4 border-2 rounded-lg transition-all ${selectedPaymentMethod === 'card'
                                        ? 'border-[#001F3F] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <FiCreditCard className={`mx-auto mb-2 ${selectedPaymentMethod === 'card' ? 'text-[#001F3F]' : 'text-gray-400'}`} size={24} />
                                <div className="text-sm font-medium">Card Payment</div>
                                <div className="text-xs text-gray-500">PayHere Gateway</div>
                            </button>

                            <button
                                onClick={() => handlePaymentMethodChange('bank_transfer')}
                                className={`p-4 border-2 rounded-lg transition-all ${selectedPaymentMethod === 'bank_transfer'
                                        ? 'border-[#001F3F] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <FiUpload className={`mx-auto mb-2 ${selectedPaymentMethod === 'bank_transfer' ? 'text-[#001F3F]' : 'text-gray-400'}`} size={24} />
                                <div className="text-sm font-medium">Bank Transfer</div>
                                <div className="text-xs text-gray-500">Manual Approval</div>
                            </button>
                        </div>

                        {/* Bank Transfer Upload */}
                        {selectedPaymentMethod === 'bank_transfer' && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-medium text-gray-800 mb-2">Bank Transfer Details</h5>
                                <div className="text-sm text-gray-600 mb-4">
                                    <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                                    <p><strong>Account Name:</strong> Lanka Spa Association</p>
                                    <p><strong>Account Number:</strong> 8001234567</p>
                                    <p><strong>Branch:</strong> Colombo Fort</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Transfer Proof <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleBankTransferUpload}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    {bankTransferProof && (
                                        <p className="text-sm text-green-600 mt-2">
                                            ✓ File uploaded: {bankTransferProof.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Button */}
                        <button
                            onClick={handlePayNow}
                            disabled={paymentProcessing || (selectedPaymentMethod === 'bank_transfer' && !bankTransferProof)}
                            className="w-full bg-[#001F3F] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {paymentProcessing ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <FiDollarSign className="mr-2" />
                                    {selectedPaymentMethod === 'card' ? 'Pay Now' : 'Submit for Approval'}
                                </div>
                            )}
                        </button>

                        {selectedPaymentMethod === 'bank_transfer' && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start">
                                    <FiAlertCircle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                                    <div className="text-sm text-yellow-800">
                                        <strong>Note:</strong> Bank transfer payments require manual approval by LSA Admin.
                                        Your plan will be activated once the payment is verified.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPlans;

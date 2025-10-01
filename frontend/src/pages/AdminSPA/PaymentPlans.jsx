import React, { useState, useContext } from 'react';
import { FiCheck, FiStar, FiCreditCard, FiShield, FiUsers, FiClock, FiTrendingUp, FiX } from 'react-icons/fi';
import { SpaContext } from './SpaContext';

const PaymentPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { subscriptionStatus, updateSubscription, addNotification } = useContext(SpaContext);

    const isSubscriptionActive = subscriptionStatus === 'active';

    const plans = [
        {
            id: 'monthly',
            name: 'Monthly',
            price: 5000,
            duration: '1 Month',
            description: 'Perfect for startups',
            color: 'from-[#0A1428] to-[#1a2f4a]',
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
            duration: '3 Months',
            description: 'Balanced growth solution',
            color: 'from-gray-700 to-gray-800',
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
            duration: '6 Months',
            description: 'Seasonal growth boost',
            color: 'from-gray-600 to-gray-700',
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
            duration: '12 Months',
            description: 'Best value with premium features',
            color: 'from-[#0A1428] to-[#D4AF37]',
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

    const handleSubscribe = () => {
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            updateSubscription(selectedPlan, 'active');
            addNotification({
                id: Date.now(),
                type: 'success',
                message: `Successfully subscribed to ${plans.find(p => p.id === selectedPlan)?.name} plan!`,
                time: 'Just now'
            });
            setIsProcessing(false);
            setShowPaymentModal(false);

            // Trigger celebration animation
            document.body.classList.add('subscription-success');
            setTimeout(() => {
                document.body.classList.remove('subscription-success');
            }, 3000);
        }, 3000);
    };

    const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {isSubscriptionActive ? 'Manage Your Subscription' : 'Choose Your Plan'}
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {isSubscriptionActive
                        ? 'Your current subscription is active. Upgrade or manage your billing preferences below.'
                        : 'Unlock the full potential of your spa management system. Choose the plan that fits your business needs.'
                    }
                </p>
            </div>

            {/* Success Banner (if subscribed) */}
            {isSubscriptionActive && (
                <div className="bg-gradient-to-r from-[#D4AF37] to-green-500 rounded-2xl p-6 text-white mb-8">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <FiCheck size={24} />
                            </div>
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-xl font-bold">🎉 Subscription Active!</h3>
                            <p className="text-green-100">You have full access to all premium features. Manage your team and grow your business!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                            <span className="text-sm text-gold-500 font-medium">
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

            {/* Plan Comparison Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Detailed Plan Comparison</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-800">Features</th>
                                {plans.map((plan) => (
                                    <th key={plan.id} className="text-center py-3 px-4">
                                        <div className="font-semibold text-gray-800">{plan.name}</div>
                                        <div className="text-sm text-gray-500">{formatCurrency(plan.price)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                'Therapist Management',
                                'Analytics Dashboard',
                                'Support Level',
                                'Mobile App',
                                'API Access',
                                'Custom Reports',
                                'Training'
                            ].map((feature, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-700">{feature}</td>
                                    <td className="text-center py-3 px-4">
                                        <FiCheck className="mx-auto text-[#D4AF37]" size={16} />
                                    </td>
                                    <td className="text-center py-3 px-4">
                                        <FiCheck className="mx-auto text-[#D4AF37]" size={16} />
                                    </td>
                                    <td className="text-center py-3 px-4">
                                        <FiCheck className="mx-auto text-[#D4AF37]" size={16} />
                                    </td>
                                    <td className="text-center py-3 px-4">
                                        <FiCheck className="mx-auto text-[#D4AF37]" size={16} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Subscribe Button */}
            {!isSubscriptionActive && (
                <div className="text-center">
                    <button
                        onClick={handleSubscribe}
                        disabled={!selectedPlan}
                        className="bg-gradient-to-r from-[#4A90E2] to-[#D4AF37] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiCreditCard className="inline mr-2" />
                        Subscribe to {selectedPlanData?.name} Plan
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                        Secure payment processing • Cancel anytime • Sri Lanka support
                    </p>
                </div>
            )}

            {/* Testimonials */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-center text-gray-800 mb-6">What Spa Owners Say</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            name: 'Priya Perera',
                            location: 'Kandy',
                            text: 'Transformed my spa operations in one click – Highly recommend!',
                            rating: 5
                        },
                        {
                            name: 'Rohan Silva',
                            location: 'Colombo',
                            text: 'The therapist management system is incredibly intuitive.',
                            rating: 5
                        },
                        {
                            name: 'Nisha Fernando',
                            location: 'Galle',
                            text: 'Customer support is exceptional. Worth every rupee!',
                            rating: 5
                        }
                    ].map((testimonial, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center mb-2">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FiStar key={i} className="text-yellow-400 fill-current" size={16} />
                                ))}
                            </div>
                            <p className="text-gray-700 text-sm mb-3">"{testimonial.text}"</p>
                            <div className="text-xs text-gray-500">
                                <strong>{testimonial.name}</strong> • {testimonial.location}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Complete Payment</h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{selectedPlanData?.name} Plan</span>
                                    <span className="font-bold text-gray-800">{formatCurrency(selectedPlanData?.price)}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{selectedPlanData?.duration}</div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <FiShield className="mr-2 text-[#D4AF37]" size={16} />
                                    Secure payment processing
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <FiUsers className="mr-2 text-[#D4AF37]" size={16} />
                                    Instant access to all features
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <FiClock className="mr-2 text-[#D4AF37]" size={16} />
                                    24/7 customer support
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processPayment}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-[#4A90E2] to-[#D4AF37] text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing Payment...
                                </div>
                            ) : (
                                <>Pay {formatCurrency(selectedPlanData?.price)}</>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By proceeding, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPlans;

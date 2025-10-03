import React, { useState, useContext } from 'react';
import { FiCheck, FiStar, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { SpaContext } from './SpaContext';

const PaymentPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const { subscriptionStatus } = useContext(SpaContext);

    const currentDate = new Date('2025-10-03');

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
                </div>
            )}
        </div>
    );
};

export default PaymentPlans;

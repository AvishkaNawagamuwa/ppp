import React, { useState, useEffect } from 'react';
import { FiUsers, FiClock, FiCreditCard, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import axios from 'axios';

const Dashboard = () => {
    const [dashboardStats, setDashboardStats] = useState({
        approved_therapists: 0,
        pending_therapists: 0,
        payment_status: 'active',
        next_payment_date: null,
        days_until_due: 0,
        current_plan: null
    });
    const [paymentStatus, setPaymentStatus] = useState({
        is_overdue: false,
        access_restricted: false,
        allowed_sections: ['dashboard', 'payment']
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchPaymentStatus();
        fetchRecentActivity();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/admin-spa-enhanced/dashboard-stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDashboardStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const fetchPaymentStatus = async () => {
        try {
            const response = await axios.get('/api/admin-spa-enhanced/payment-status', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPaymentStatus(response.data);
        } catch (error) {
            console.error('Error fetching payment status:', error);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const response = await axios.get('/api/admin-spa-enhanced/recent-activity', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRecentActivity(response.data.activities || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            setLoading(false);
        }
    };

    const getPaymentStatusColor = () => {
        if (paymentStatus.is_overdue) return 'text-red-600';
        if (dashboardStats.days_until_due <= 7) return 'text-orange-600';
        return 'text-green-600';
    };

    const getPaymentStatusIcon = () => {
        if (paymentStatus.is_overdue) return <FiXCircle className="text-red-600" />;
        if (dashboardStats.days_until_due <= 7) return <FiAlertCircle className="text-orange-600" />;
        return <FiCheckCircle className="text-green-600" />;
    };

    if (loading) {
        return (
            <div className="animate-fadeIn flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">AdminSPA Dashboard</h2>
                <p className="text-gray-600">Enhanced Spa Management with Payment Tracking</p>
            </div>

            {/* Payment Status Alert */}
            {paymentStatus.is_overdue && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
                    <div className="flex items-center">
                        <FiAlertCircle className="text-red-400 mr-3" size={20} />
                        <div>
                            <h3 className="text-red-800 font-medium">Payment Overdue</h3>
                            <p className="text-red-700 text-sm">Your payment is overdue. Some features may be restricted until payment is made.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-2">
                                <FiUsers size={24} />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Approved Therapists</h3>
                            <p className="text-2xl font-bold text-gray-800">{dashboardStats.approved_therapists}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                                <FiClock size={24} />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
                            <p className="text-2xl font-bold text-gray-800">{dashboardStats.pending_therapists}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mb-2">
                                <FiCreditCard size={24} />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Payment Status</h3>
                            <p className={`text-lg font-bold ${getPaymentStatusColor()}`}>
                                {paymentStatus.is_overdue ? 'Overdue' : 'Active'}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                                Plan: {dashboardStats.current_plan || 'Monthly'}
                            </div>
                        </div>
                        <div className="text-2xl">
                            {getPaymentStatusIcon()}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-2">
                                <FiClock size={24} />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Next Payment</h3>
                            <p className="text-lg font-bold text-gray-800">
                                {dashboardStats.days_until_due > 0 ? `${dashboardStats.days_until_due} days` : 'Due now'}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                                {dashboardStats.next_payment_date || 'Not scheduled'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Plan Info */}
            <div className="bg-gradient-to-r from-[#001F3F] to-[#002A5C] rounded-lg shadow p-6 mb-8 text-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FiCreditCard className="mr-2 text-[#FFD700]" />
                    Current Payment Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm opacity-90">Plan Type</p>
                        <p className="text-xl font-bold text-[#FFD700]">{dashboardStats.current_plan || 'Monthly'}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Next Payment</p>
                        <p className="text-lg font-semibold">{dashboardStats.next_payment_date || 'Not scheduled'}</p>
                    </div>
                    <div>
                        <button
                            onClick={() => window.location.href = '/adminSPA?tab=payment'}
                            className="bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                        >
                            Manage Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* Access Restrictions Warning */}
            {paymentStatus.access_restricted && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg">
                    <div className="flex items-center">
                        <FiAlertCircle className="text-orange-400 mr-3" size={20} />
                        <div>
                            <h3 className="text-orange-800 font-medium">Limited Access</h3>
                            <p className="text-orange-700 text-sm">
                                Some features are restricted due to payment status. Only {paymentStatus.allowed_sections.join(', ')} sections are available.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiClock className="mr-2 text-[#FFD700]" />
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300 border-l-4 border-[#FFD700]">
                            <div className="flex-shrink-0 w-12 h-12 bg-[#001F3F] rounded-full flex items-center justify-center">
                                <span className="text-[#FFD700] font-semibold text-sm">
                                    {activity.type === 'therapist_request' ? 'THR' :
                                        activity.type === 'payment_made' ? 'PAY' :
                                            activity.type === 'profile_update' ? 'UPD' : 'SPA'}
                                </span>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                                <p className="text-xs text-gray-500 mt-1">{activity.time_ago}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-gray-500">
                            <FiClock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No recent activity</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`rounded-lg shadow p-6 ${paymentStatus.access_restricted ? 'bg-gray-100 cursor-not-allowed' : 'bg-gradient-to-r from-[#001F3F] to-[#002A5C] cursor-pointer hover:shadow-lg'} transition-all`}>
                    <h4 className={`text-lg font-semibold mb-3 ${paymentStatus.access_restricted ? 'text-gray-500' : 'text-white'}`}>
                        Therapist Management
                    </h4>
                    <p className={`text-sm mb-4 ${paymentStatus.access_restricted ? 'text-gray-400' : 'text-white opacity-90'}`}>
                        Add, manage, and track your therapists
                    </p>
                    <button
                        disabled={paymentStatus.access_restricted}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${paymentStatus.access_restricted
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#FFD700] text-[#001F3F] hover:bg-yellow-400'
                            }`}
                    >
                        {paymentStatus.access_restricted ? 'Restricted' : 'Manage Therapists'}
                    </button>
                </div>

                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-lg shadow p-6 text-[#001F3F] cursor-pointer hover:shadow-lg transition-all">
                    <h4 className="text-lg font-semibold mb-3">Payment Plans</h4>
                    <p className="text-sm opacity-90 mb-4">View and manage your subscription</p>
                    <button className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium">
                        View Plans
                    </button>
                </div>

                <div className={`rounded-lg shadow p-6 ${paymentStatus.access_restricted ? 'bg-gray-100 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 cursor-pointer hover:shadow-lg'} transition-all`}>
                    <h4 className={`text-lg font-semibold mb-3 ${paymentStatus.access_restricted ? 'text-gray-500' : 'text-white'}`}>
                        Spa Profile
                    </h4>
                    <p className={`text-sm mb-4 ${paymentStatus.access_restricted ? 'text-gray-400' : 'text-white opacity-90'}`}>
                        Update your spa information and settings
                    </p>
                    <button
                        disabled={paymentStatus.access_restricted}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${paymentStatus.access_restricted
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-green-600 hover:bg-gray-100'
                            }`}
                    >
                        {paymentStatus.access_restricted ? 'Restricted' : 'Update Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
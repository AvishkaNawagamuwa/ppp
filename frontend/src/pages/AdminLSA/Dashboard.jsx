import React, { useState, useEffect } from 'react';
import { FiGrid, FiClock, FiCreditCard, FiFileText, FiAlertTriangle, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import axios from 'axios';

// Chart.js will be installed later
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
// import { Bar, Line } from 'react-chartjs-2';
// ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    total_spas: 0,
    verified_spas: 0,
    unverified_spas: 0,
    blacklisted_spas: 0,
    total_therapists: 0,
    pending_spas: 0,
    pending_therapists: 0,
    monthly_revenue: 0,
    annual_revenue: 0
  });
  const [financialData, setFinancialData] = useState({
    labels: [],
    registration_fees: [],
    annual_fees: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchFinancialData();
    fetchRecentActivity();

    // Listen for tab change events from Quick Actions
    const handleTabChange = (event) => {
      if (window.parent && window.parent.setActiveTab) {
        window.parent.setActiveTab(event.detail);
      }
    };

    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/lsa/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setDashboardStats({
          total_spas: data.spa_statistics?.total_spas || 0,
          verified_spas: data.spa_statistics?.verified_spas || 0,
          unverified_spas: data.spa_statistics?.pending_verification || 0,
          blacklisted_spas: data.spa_statistics?.rejected_spas || 0,
          total_therapists: data.therapist_statistics?.total_therapists || 0,
          pending_spas: data.spa_statistics?.pending_verification || 0,
          pending_therapists: data.therapist_statistics?.pending_applications || 0,
          monthly_revenue: 245000, // TODO: Add this to backend
          annual_revenue: 2850000 // TODO: Add this to backend
        });

        // Set recent activities
        setRecentActivity(data.recent_activities || []);
        console.log('Dashboard data loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use fallback data for demo purposes
      setDashboardStats({
        total_spas: 5, // From seeded data
        verified_spas: 2,
        unverified_spas: 3,
        blacklisted_spas: 0,
        total_therapists: 8, // From seeded data
        pending_spas: 3,
        pending_therapists: 3,
        monthly_revenue: 245000,
        annual_revenue: 2850000
      });
    }
  };

  const fetchFinancialData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.get(`/api/admin-lsa/financial-reports/${currentYear}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = response.data.monthly_data;
      setFinancialData({
        labels: data.map(item => `${item.month}/2025`),
        registration_fees: data.map(item => item.registration_fees || 0),
        annual_fees: data.map(item => item.annual_fees || 0)
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get('/api/admin-lsa/recent-activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecentActivity(response.data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Use fallback data for demo purposes
      setRecentActivity([
        {
          type: 'spa_registration',
          description: 'New spa registration from Colombo Wellness Center',
          time_ago: '2 hours ago',
          reference_number: 'LSA0045'
        },
        {
          type: 'therapist_approval',
          description: 'Therapist application approved for Jane Smith',
          time_ago: '4 hours ago',
          reference_number: 'LSA0044'
        },
        {
          type: 'payment_received',
          description: 'Spa verification completed for Royal Spa',
          time_ago: '1 day ago',
          reference_number: 'LSA0043'
        }
      ]);
      setLoading(false);
    }
  };

  // Chart configuration - Will be enabled when Chart.js is installed
  /*
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Financial Overview' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const chartData = {
    labels: financialData.labels,
    datasets: [
      {
        label: 'Registration Fees (LKR)',
        data: financialData.registration_fees,
        backgroundColor: 'rgba(255, 215, 0, 0.6)',
        borderColor: 'rgba(255, 215, 0, 1)',
        borderWidth: 2
      },
      {
        label: 'Annual Fees (LKR)',
        data: financialData.annual_fees,
        backgroundColor: 'rgba(0, 31, 63, 0.6)',
        borderColor: 'rgba(0, 31, 63, 1)',
        borderWidth: 2
      }
    ]
  };
  */

  if (loading) {
    return (
      <div className="animate-fadeIn flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">LSA Admin Dashboard</h2>
          <p className="text-gray-600">Enhanced spa management and financial tracking</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border border-[#001F3F]">
          <div className="flex items-center">
            <div className="p-3 bg-[#FFD700]/20 rounded-lg">
              <FiGrid className="text-2xl text-[#FFD700]" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-[#001F3F]">Total Registered Spas</h3>
              <p className="text-3xl font-bold text-[#FFD700]">{dashboardStats.total_spas}</p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">Verified: {dashboardStats.verified_spas}</span> |
                <span className="text-orange-600 ml-1">Pending: {dashboardStats.pending_spas}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border border-[#001F3F]">
          <div className="flex items-center">
            <div className="p-3 bg-[#001F3F]/20 rounded-lg">
              <FiFileText className="text-2xl text-[#001F3F]" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-[#001F3F]">Total Registered Therapists</h3>
              <p className="text-3xl font-bold text-[#FFD700]">{dashboardStats.total_therapists}</p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-600">Pending: {dashboardStats.pending_therapists}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border border-[#001F3F]">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="text-2xl text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-[#001F3F]">Pending Actions</h3>
              <p className="text-3xl font-bold text-[#FFD700]">{dashboardStats.pending_spas + dashboardStats.pending_therapists}</p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-orange-600">{dashboardStats.pending_spas} Spas, {dashboardStats.pending_therapists} Therapists</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105 border border-[#001F3F]">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="text-2xl text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-[#001F3F]">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-[#FFD700]">LKR {dashboardStats.monthly_revenue?.toLocaleString() || '0'}</p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">Annual: LKR {dashboardStats.annual_revenue?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blacklisted Spas Warning Card - Only show if there are blacklisted spas */}
      {dashboardStats.blacklisted_spas > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-red-300 bg-red-50">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertTriangle className="text-2xl text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-red-700">Blacklisted Spas Alert</h3>
                <p className="text-3xl font-bold text-red-600">{dashboardStats.blacklisted_spas}</p>
                <div className="text-xs text-red-500 mt-1">Requires immediate attention</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Chart - Placeholder until Chart.js is installed */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiTrendingUp className="mr-2 text-[#FFD700]" />
          Monthly Financial Overview - 2025
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <FiTrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Financial Chart</p>
            <p className="text-sm">Chart.js integration ready</p>
            <p className="text-sm">Install Chart.js to see monthly revenue graphs</p>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiClock className="mr-2 text-[#FFD700]" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300 border-l-4 border-[#FFD700]">
              <div className="flex-shrink-0 w-12 h-12 bg-[#001F3F] rounded-full flex items-center justify-center">
                <span className="text-[#FFD700] font-semibold text-sm">
                  {activity.type === 'spa_registration' ? 'SPA' :
                    activity.type === 'therapist_approval' ? 'THR' :
                      activity.type === 'payment_received' ? 'PAY' : 'LSA'}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{activity.time_ago}</p>
                  {activity.reference_number && (
                    <span className="text-xs bg-[#FFD700] text-[#001F3F] px-2 py-1 rounded-full font-medium">
                      {activity.reference_number}
                    </span>
                  )}
                </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-r from-[#001F3F] to-[#002A5C] rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-3">
            <FiGrid className="text-[#FFD700] text-xl mr-2" />
            <h4 className="text-lg font-semibold">Spa Management</h4>
          </div>
          <p className="text-sm opacity-90 mb-4">Manage spa registrations, approvals, and verifications</p>
          <div className="flex space-x-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'spas' }))}
              className="bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium text-sm"
            >
              Manage Spas
            </button>
            <span className="text-xs bg-[#FFD700]/20 text-[#FFD700] px-2 py-1 rounded-full">
              {dashboardStats.pending_spas} pending
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-lg shadow p-6 text-[#001F3F]">
          <div className="flex items-center mb-3">
            <FiTrendingUp className="text-[#001F3F] text-xl mr-2" />
            <h4 className="text-lg font-semibold">Financial Reports</h4>
          </div>
          <p className="text-sm opacity-90 mb-4">View detailed financial analytics and monthly reports</p>
          <div className="flex space-x-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'financial' }))}
              className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
            >
              View Reports
            </button>
            <span className="text-xs bg-[#001F3F]/20 text-[#001F3F] px-2 py-1 rounded-full">
              LKR {dashboardStats.monthly_revenue?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-3">
            <FiCreditCard className="text-[#FFD700] text-xl mr-2" />
            <h4 className="text-lg font-semibold">Third-Party Access</h4>
          </div>
          <p className="text-sm opacity-90 mb-4">Manage government officer access accounts</p>
          <div className="flex space-x-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'third-party' }))}
              className="bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Manage Access
            </button>
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
              Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiClock, FiUser, FiCalendar, FiBell } from 'react-icons/fi';
import axios from 'axios';

const NotificationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'approved', 'rejected'

    useEffect(() => {
        fetchNotificationHistory();
    }, []);

    const fetchNotificationHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin-spa-new/notification-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Ensure we always get an array
            const historyData = Array.isArray(response.data) ? response.data :
                (response.data?.history && Array.isArray(response.data.history)) ? response.data.history :
                    [];

            console.log('Notification history response:', response.data);
            console.log('Processed history data:', historyData);

            setHistory(historyData);
        } catch (error) {
            console.error('Error fetching notification history:', error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <FiCheck className="text-green-600" size={16} />;
            case 'rejected':
                return <FiX className="text-red-600" size={16} />;
            default:
                return <FiClock className="text-yellow-600" size={16} />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const filteredHistory = Array.isArray(history) ? history.filter(item => {
        if (filter === 'all') return ['approved', 'rejected'].includes(item.status);
        return item.status === filter;
    }) : [];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="animate-fadeIn flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading notification history...</div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Notification History</h2>
                <p className="text-gray-600">View the history of approved and rejected therapist requests</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'all'
                            ? 'bg-white text-[#001F3F] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All ({Array.isArray(history) ? history.filter(h => ['approved', 'rejected'].includes(h.status)).length : 0})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'approved'
                            ? 'bg-white text-[#001F3F] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Approved ({Array.isArray(history) ? history.filter(h => h.status === 'approved').length : 0})
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'rejected'
                            ? 'bg-white text-[#001F3F] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Rejected ({Array.isArray(history) ? history.filter(h => h.status === 'rejected').length : 0})
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FiUser className="mr-2" />
                                        Therapist Name
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2" />
                                        Date
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NIC Number
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                                                {getStatusIcon(item.status)}
                                                <span className="ml-1 capitalize">{item.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(item.updated_at || item.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.nic}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FiBell size={48} className="text-gray-300 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                                            <p className="text-gray-500">
                                                {filter === 'all'
                                                    ? 'No approved or rejected therapists yet.'
                                                    : `No ${filter} therapists found.`
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            {filteredHistory.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <FiCheck className="text-green-600 mr-2" size={20} />
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Approved</p>
                                <p className="text-2xl font-bold text-green-800">
                                    {Array.isArray(history) ? history.filter(h => h.status === 'approved').length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <FiX className="text-red-600 mr-2" size={20} />
                            <div>
                                <p className="text-sm text-red-600 font-medium">Total Rejected</p>
                                <p className="text-2xl font-bold text-red-800">
                                    {Array.isArray(history) ? history.filter(h => h.status === 'rejected').length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <FiBell className="text-blue-600 mr-2" size={20} />
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Processed</p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {Array.isArray(history) ? history.filter(h => ['approved', 'rejected'].includes(h.status)).length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationHistory;
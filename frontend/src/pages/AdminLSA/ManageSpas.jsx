import React, { useState, useEffect } from 'react';
import {
    FiGrid,
    FiSearch,
    FiFilter,
    FiEye,
    FiCheck,
    FiX,
    FiAlertTriangle,
    FiDollarSign,
    FiCalendar,
    FiMapPin,
    FiPhone,
    FiMail,
    FiFileText,
    FiDownload,
    FiRefreshCw,
    FiUserX,
    FiShield
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManageSpas = () => {
    const [spas, setSpas] = useState([]);
    const [filteredSpas, setFilteredSpas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('approved');
    const [approvedSubCategory, setApprovedSubCategory] = useState('all');
    const [selectedSpa, setSelectedSpa] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        verified: 0,
        unverified: 0,
        blacklisted: 0
    });

    useEffect(() => {
        fetchSpas();
    }, []);

    useEffect(() => {
        if (spas.length > 0) {
            calculateStats();
            filterSpas();
        }
    }, [spas, searchQuery, activeTab, approvedSubCategory]);

    const fetchSpas = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/lsa/spas', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setSpas(response.data.data.spas || []);
                console.log('Spas loaded:', response.data.data.spas);
            }
        } catch (error) {
            console.error('Error fetching spas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load spa data. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const total = spas.length;
        const approved = spas.filter(spa =>
            spa.verification_status === 'approved' || spa.status === 'verified' || spa.status === 'approved'
        ).length;
        const rejected = spas.filter(spa =>
            spa.verification_status === 'rejected' || spa.status === 'rejected'
        ).length;
        const pending = spas.filter(spa =>
            spa.verification_status === 'pending' || spa.status === 'pending'
        ).length;

        // Calculate approved sub-categories
        const approvedSpas = spas.filter(spa =>
            spa.verification_status === 'approved' || spa.status === 'verified' || spa.status === 'approved'
        );

        const verified = approvedSpas.filter(spa =>
            spa.payment_status === 'paid' && !spa.blacklist_reason
        ).length;
        const unverified = approvedSpas.filter(spa =>
            spa.payment_status !== 'paid' && !spa.blacklist_reason
        ).length;
        const blacklisted = approvedSpas.filter(spa =>
            spa.blacklist_reason
        ).length;

        setStats({
            total,
            approved,
            rejected,
            pending,
            verified,
            unverified,
            blacklisted
        });
    };

    const filterSpas = () => {
        let filtered = spas;

        // Search filter - search by spa name, reference number, owner name
        if (searchQuery) {
            filtered = filtered.filter(spa => {
                const searchTerm = searchQuery.toLowerCase();
                return (
                    spa.spa_name?.toLowerCase().includes(searchTerm) ||
                    spa.spa_id?.toString().includes(searchTerm) ||
                    spa.owner_name?.toLowerCase().includes(searchTerm) ||
                    spa.email?.toLowerCase().includes(searchTerm)
                );
            });
        }

        // Main category filter
        filtered = filtered.filter(spa => {
            switch (activeTab) {
                case 'approved':
                    return spa.verification_status === 'approved' || spa.status === 'verified' || spa.status === 'approved';
                case 'rejected':
                    return spa.verification_status === 'rejected' || spa.status === 'rejected';
                case 'pending':
                    return spa.verification_status === 'pending' || spa.status === 'pending';
                default:
                    return true;
            }
        });

        // Sub-category filter for approved spas
        if (activeTab === 'approved' && approvedSubCategory !== 'all') {
            filtered = filtered.filter(spa => {
                switch (approvedSubCategory) {
                    case 'verified':
                        return spa.payment_status === 'paid' && !spa.blacklist_reason;
                    case 'unverified':
                        return spa.payment_status !== 'paid' && !spa.blacklist_reason;
                    case 'blacklisted':
                        return spa.blacklist_reason;
                    default:
                        return true;
                }
            });
        }

        setFilteredSpas(filtered);
    };

    const handleStatusUpdate = async (spaId, action, reason = null) => {
        try {
            let endpoint = '';
            let successMessage = '';
            let payload = {};

            switch (action) {
                case 'approve':
                    endpoint = `http://localhost:5000/api/admin-lsa-enhanced/spas/${spaId}/approve`;
                    successMessage = 'Spa approved successfully';
                    break;
                case 'reject':
                    endpoint = `http://localhost:5000/api/admin-lsa-enhanced/spas/${spaId}/reject`;
                    successMessage = 'Spa rejected successfully';
                    payload = { reason };
                    break;
                case 'blacklist':
                    endpoint = `http://localhost:5000/api/admin-lsa-enhanced/spas/${spaId}/blacklist`;
                    successMessage = 'Spa blacklisted successfully';
                    payload = { reason };
                    break;
                default:
                    return;
            }

            const response = await axios.patch(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: successMessage,
                    showConfirmButton: false,
                    timer: 1500
                });

                fetchSpas();
            }
        } catch (error) {
            console.error(`Error ${action} spa:`, error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Failed to ${action} spa. Please try again.`
            });
        }
    };

    const handleApprove = async (spa) => {
        const result = await Swal.fire({
            title: 'Approve Spa Registration',
            text: `Are you sure you want to approve ${spa.spa_name || spa.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#001F3F',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            handleStatusUpdate(spa.spa_id, 'approve');
        }
    };

    const handleReject = async (spa) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Spa Registration',
            text: `Please provide a reason for rejecting ${spa.spa_name || spa.name}:`,
            input: 'textarea',
            inputPlaceholder: 'Enter rejection reason...',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please provide a reason for rejection';
                }
            }
        });

        if (reason) {
            handleStatusUpdate(spa.spa_id, 'reject', reason.trim());
        }
    };

    const handleBlacklist = async (spa) => {
        const { value: reason } = await Swal.fire({
            title: 'Blacklist Spa',
            text: `Please provide a reason for blacklisting ${spa.spa_name || spa.name}:`,
            input: 'textarea',
            inputPlaceholder: 'Enter blacklist reason...',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Blacklist',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please provide a reason for blacklisting';
                }
            }
        });

        if (reason) {
            handleStatusUpdate(spa.spa_id, 'blacklist', reason.trim());
        }
    };

    const handleViewDetails = (spa) => {
        setSelectedSpa(spa);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (spa) => {
        if (spa.blacklist_reason) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Blacklisted</span>;
        } else if (spa.verification_status === 'approved' || spa.status === 'verified' || spa.status === 'approved') {
            if (spa.payment_status === 'paid') {
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Verified</span>;
            } else {
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Unverified</span>;
            }
        } else if (spa.verification_status === 'pending' || spa.status === 'pending') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Pending</span>;
        } else if (spa.verification_status === 'rejected' || spa.status === 'rejected') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    };

    const renderActions = (spa) => {
        const actions = [];

        // View action - always available
        actions.push(
            <button
                key="view"
                onClick={() => handleViewDetails(spa)}
                className="px-3 py-1 text-xs bg-[#001F3F] text-white rounded hover:bg-opacity-80 transition-colors flex items-center gap-1"
                title="View Details"
            >
                <FiEye size={12} />
                View
            </button>
        );

        // Pending spas: Approve/Reject actions
        if (spa.verification_status === 'pending' || spa.status === 'pending') {
            actions.push(
                <button
                    key="approve"
                    onClick={() => handleApprove(spa)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    title="Approve Spa"
                >
                    <FiCheck size={12} />
                    Approve
                </button>
            );
            actions.push(
                <button
                    key="reject"
                    onClick={() => handleReject(spa)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                    title="Reject Spa"
                >
                    <FiX size={12} />
                    Reject
                </button>
            );
        }

        // Approved spas (verified/unverified): Blacklist action
        if ((spa.verification_status === 'approved' || spa.status === 'verified' || spa.status === 'approved') && !spa.blacklist_reason) {
            actions.push(
                <button
                    key="blacklist"
                    onClick={() => handleBlacklist(spa)}
                    className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center gap-1"
                    title="Add to Blacklist"
                >
                    <FiUserX size={12} />
                    Blacklist
                </button>
            );
        }

        return (
            <div className="flex gap-2 flex-wrap">
                {actions}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Spas</h2>
                    <p className="text-gray-600">Enhanced spa management like therapist management system</p>
                </div>
                <button
                    onClick={fetchSpas}
                    className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                    disabled={loading}
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>

            {/* Main Category Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
                    <div className="flex items-center">
                        <FiGrid className="text-[#001F3F] mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Total Spas</p>
                            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div
                    className={`bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer transition-all ${activeTab === 'approved' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                        }`}
                    onClick={() => {
                        setActiveTab('approved');
                        setApprovedSubCategory('all');
                    }}
                >
                    <div className="flex items-center">
                        <FiCheck className="text-green-500 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Approved Spas</p>
                            <p className="text-xl font-bold text-gray-800">{stats.approved}</p>
                        </div>
                    </div>
                </div>

                <div
                    className={`bg-white rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer transition-all ${activeTab === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
                        }`}
                    onClick={() => setActiveTab('rejected')}
                >
                    <div className="flex items-center">
                        <FiX className="text-red-500 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Rejected Spas</p>
                            <p className="text-xl font-bold text-gray-800">{stats.rejected}</p>
                        </div>
                    </div>
                </div>

                <div
                    className={`bg-white rounded-lg shadow p-4 border-l-4 border-blue-400 cursor-pointer transition-all ${activeTab === 'pending' ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    onClick={() => setActiveTab('pending')}
                >
                    <div className="flex items-center">
                        <FiFileText className="text-blue-400 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Pending Spas</p>
                            <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Category Stats Cards (Show only when Approved is selected) */}
            {activeTab === 'approved' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div
                        className={`bg-white rounded-lg shadow p-4 border-l-4 border-green-400 cursor-pointer transition-all ${approvedSubCategory === 'verified' ? 'ring-2 ring-green-400 bg-green-50' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => setApprovedSubCategory(approvedSubCategory === 'verified' ? 'all' : 'verified')}
                    >
                        <div className="flex items-center">
                            <FiCheck className="text-green-400 mr-3" size={18} />
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-lg font-bold text-gray-800">{stats.verified}</p>
                                <p className="text-xs text-gray-500">Paid annual fee</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`bg-white rounded-lg shadow p-4 border-l-4 border-orange-500 cursor-pointer transition-all ${approvedSubCategory === 'unverified' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => setApprovedSubCategory(approvedSubCategory === 'unverified' ? 'all' : 'unverified')}
                    >
                        <div className="flex items-center">
                            <FiCalendar className="text-orange-500 mr-3" size={18} />
                            <div>
                                <p className="text-sm text-gray-600">Unverified</p>
                                <p className="text-lg font-bold text-gray-800">{stats.unverified}</p>
                                <p className="text-xs text-gray-500">Unpaid annual fee</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`bg-white rounded-lg shadow p-4 border-l-4 border-red-600 cursor-pointer transition-all ${approvedSubCategory === 'blacklisted' ? 'ring-2 ring-red-600 bg-red-50' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => setApprovedSubCategory(approvedSubCategory === 'blacklisted' ? 'all' : 'blacklisted')}
                    >
                        <div className="flex items-center">
                            <FiAlertTriangle className="text-red-600 mr-3" size={18} />
                            <div>
                                <p className="text-sm text-gray-600">Blacklisted</p>
                                <p className="text-lg font-bold text-gray-800">{stats.blacklisted}</p>
                                <p className="text-xs text-gray-500">Admin blacklisted</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by spa name, reference number, or owner..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Spa List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {activeTab === 'approved'
                            ? `Approved Spas ${approvedSubCategory !== 'all' ? `- ${approvedSubCategory.charAt(0).toUpperCase() + approvedSubCategory.slice(1)}` : ''}`
                            : activeTab === 'rejected'
                                ? 'Rejected Spas'
                                : 'Pending Spas'
                        }
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Viewing: {filteredSpas.length} spa(s)
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <FiRefreshCw className="animate-spin text-2xl text-gray-400 mr-3" />
                        <span className="text-gray-500">Loading spas...</span>
                    </div>
                ) : filteredSpas.length === 0 ? (
                    <div className="text-center py-12">
                        <FiGrid className="mx-auto text-4xl text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-500">No spas found</p>
                        <p className="text-sm text-gray-400">
                            {searchQuery ? 'Try adjusting your search terms' : `No ${activeTab} spas available`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spa Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reference
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registration Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSpas.map((spa, index) => (
                                    <tr key={spa.spa_id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-[#001F3F] flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">
                                                            {spa.spa_name?.charAt(0)?.toUpperCase() || 'S'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {spa.spa_name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {spa.owner_name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {spa.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">SPA-{spa.spa_id || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{spa.city || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(spa)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {spa.payment_status === 'paid' ?
                                                    <span className="text-green-600 font-medium">Paid</span> :
                                                    <span className="text-orange-600 font-medium">Pending</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {spa.created_at ? new Date(spa.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {renderActions(spa)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Spa Details Modal */}
            {showDetailsModal && selectedSpa && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Spa Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Basic Information</h4>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Spa Name</label>
                                        <p className="text-sm text-gray-900">{selectedSpa.spa_name || selectedSpa.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Reference Number</label>
                                        <p className="text-sm text-gray-900">{selectedSpa.reference_number || `SPA-${selectedSpa.spa_id}` || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                                        <p className="text-sm text-gray-900">{selectedSpa.contact_phone || selectedSpa.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedSpa)}</div>
                                    </div>
                                </div>

                                {/* Owner Information */}
                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Owner Information</h4>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Owner Name</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedSpa.owner_name ||
                                                (selectedSpa.owner_fname && selectedSpa.owner_lname ?
                                                    `${selectedSpa.owner_fname} ${selectedSpa.owner_lname}` : 'N/A')
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-sm text-gray-900">{selectedSpa.email || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Address Information</h4>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedSpa.address || selectedSpa.city || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Registration Information */}
                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Registration Information</h4>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Registration Date</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedSpa.created_at ? new Date(selectedSpa.created_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Annual Payment Status</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedSpa.payment_status === 'paid' || selectedSpa.annual_payment_status === 'paid' ?
                                                <span className="text-green-600 font-medium">✅ Paid</span> :
                                                selectedSpa.payment_status === 'overdue' || selectedSpa.annual_payment_status === 'overdue' ?
                                                    <span className="text-red-600 font-medium">⚠️ Overdue</span> :
                                                    <span className="text-orange-600 font-medium">⏳ Pending</span>
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedSpa.payment_method ?
                                                (selectedSpa.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Card Payment') :
                                                'Not specified'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Next Payment Due</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedSpa.next_payment_date ?
                                                new Date(selectedSpa.next_payment_date).toLocaleDateString() :
                                                'Not set'
                                            }
                                        </p>
                                    </div>
                                    {selectedSpa.blacklist_reason && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Blacklist Reason</label>
                                            <p className="text-sm text-red-600">{selectedSpa.blacklist_reason}</p>
                                        </div>
                                    )}
                                    {selectedSpa.reject_reason && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                                            <p className="text-sm text-red-600">{selectedSpa.reject_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="mt-6 space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Documents & Certificates</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(() => {
                                        // Helper function to get document path
                                        const getDocumentPath = (docPath) => {
                                            if (!docPath) return null;
                                            if (typeof docPath === 'string') {
                                                try {
                                                    const parsed = JSON.parse(docPath);
                                                    return Array.isArray(parsed) ? parsed[0] : parsed;
                                                } catch {
                                                    return docPath;
                                                }
                                            }
                                            return Array.isArray(docPath) ? docPath[0] : docPath;
                                        };

                                        const documents = [
                                            { key: 'certificate', label: 'Main Certificate', path: getDocumentPath(selectedSpa.certificate_path) },
                                            { key: 'form1', label: 'Form 1 Certificate', path: getDocumentPath(selectedSpa.form1_certificate_path) },
                                            { key: 'nic_front', label: 'NIC Front', path: getDocumentPath(selectedSpa.nic_front_path) },
                                            { key: 'nic_back', label: 'NIC Back', path: getDocumentPath(selectedSpa.nic_back_path) },
                                            { key: 'br_attachment', label: 'Business Registration', path: getDocumentPath(selectedSpa.br_attachment_path) },
                                            { key: 'other_document', label: 'Other Documents', path: getDocumentPath(selectedSpa.other_document_path) }
                                        ];

                                        return documents.map(doc => (
                                            doc.path && (
                                                <div key={doc.key}>
                                                    <label className="text-sm font-medium text-gray-500">{doc.label}</label>
                                                    <a
                                                        href={`http://localhost:5000/${doc.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-[#001F3F] hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        <FiDownload size={12} /> View Document
                                                    </a>
                                                </div>
                                            )
                                        ));
                                    })()}
                                </div>

                                {/* Spa Photos Section */}
                                {selectedSpa.spa_photos_banner && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Spa Gallery</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {selectedSpa.spa_photos_banner.split(',').map((photo, index) => (
                                                <div key={`photo-${index}`} className="relative">
                                                    <img
                                                        src={photo.trim()}
                                                        alt={`Spa photo ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(photo.trim(), '_blank')}
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiLz4KPHA+';
                                                            e.target.alt = 'Image not found';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Documents Message */}
                                {!selectedSpa.certificate_path && !selectedSpa.form1_certificate_path &&
                                    !selectedSpa.nic_front_path && !selectedSpa.nic_back_path &&
                                    !selectedSpa.br_attachment_path && !selectedSpa.other_document_path && (
                                        <div className="text-center py-4 text-gray-500">
                                            <FiFileText className="mx-auto text-2xl text-gray-300 mb-2" />
                                            <p className="text-sm">No documents uploaded</p>
                                        </div>
                                    )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {(selectedSpa.verification_status === 'pending' || selectedSpa.status === 'pending') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                handleApprove(selectedSpa);
                                            }}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                handleReject(selectedSpa);
                                            }}
                                            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {((selectedSpa.verification_status === 'approved' || selectedSpa.status === 'verified' || selectedSpa.status === 'approved') && !selectedSpa.blacklist_reason) && (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleBlacklist(selectedSpa);
                                        }}
                                        className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                        Add to Blacklist
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSpas;
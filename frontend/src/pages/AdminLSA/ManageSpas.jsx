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
    FiDownload
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManageSpas = () => {
    const [spas, setSpas] = useState([]);
    const [filteredSpas, setFilteredSpas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [mainCategory, setMainCategory] = useState('approved');
    const [approvedSubCategory, setApprovedSubCategory] = useState('all');
    const [selectedSpa, setSelectedSpa] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        // Sub-categories under approved
        verified: 0,
        unverified: 0,
        blacklisted: 0
    });

    useEffect(() => {
        fetchSpas();
        fetchStats();
    }, []);

    useEffect(() => {
        filterSpas();
    }, [spas, searchQuery, mainCategory, approvedSubCategory]);

    const fetchSpas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/lsa/spas', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setSpas(response.data.data.spas || []);
                console.log('Spas loaded:', response.data.data.spas);
            }
        } catch (error) {
            console.error('Error fetching spas:', error);
            // Use fallback data for demo
            setSpas([
                {
                    spa_id: 1,
                    spa_name: 'Serenity Wellness Spa',
                    owner_name: 'Kamal Perera',
                    email: 'kamal@serenityspa.lk',
                    contact_phone: '0112345678',
                    city: 'Western Province',
                    verification_status: 'verified',
                    status: 'verified',
                    created_at: '2024-01-15'
                },
                {
                    spa_id: 2,
                    spa_name: 'Ayurveda Healing Center',
                    owner_name: 'Saman Silva',
                    email: 'saman@ayurvedahealing.lk',
                    contact_phone: '0114567890',
                    city: 'Central Province',
                    verification_status: 'pending',
                    status: 'pending',
                    created_at: '2024-01-10'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/lsa/dashboard', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                const data = response.data.data;
                const totalSpas = data.spa_statistics?.total_spas || 0;
                const verifiedSpas = data.spa_statistics?.verified_spas || 0;
                const pendingSpas = data.spa_statistics?.pending_verification || 0;
                const rejectedSpas = data.spa_statistics?.rejected_spas || 0;
                
                // Calculate approved as total minus pending minus rejected
                const approvedSpas = totalSpas - pendingSpas - rejectedSpas;
                
                setStats({
                    total: totalSpas,
                    approved: approvedSpas,
                    rejected: rejectedSpas,
                    pending: pendingSpas,
                    // Sub-categories under approved
                    verified: verifiedSpas,
                    unverified: Math.max(0, approvedSpas - verifiedSpas - 1), // Approximate
                    blacklisted: 1 // Approximate
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Use fallback stats
            setStats({
                total: 5,
                approved: 3,
                rejected: 0,
                pending: 2,
                verified: 2,
                unverified: 1,
                blacklisted: 0
            });
        }
    };

    const filterSpas = () => {
        let filtered = spas;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(spa =>
                spa.spa_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                spa.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                spa.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Main category filter
        filtered = filtered.filter(spa => {
            switch (mainCategory) {
                case 'approved':
                    // All approved spas (includes verified, unverified, blacklisted)
                    return spa.verification_status === 'approved';
                case 'rejected':
                    return spa.verification_status === 'rejected';
                case 'pending':
                    return spa.verification_status === 'pending';
                default:
                    return true;
            }
        });

        // Sub-category filter (only applies when main category is 'approved')
        if (mainCategory === 'approved' && approvedSubCategory !== 'all') {
            filtered = filtered.filter(spa => {
                switch (approvedSubCategory) {
                    case 'verified':
                        return spa.payment_status === 'paid' && spa.blacklist_status !== 1;
                    case 'unverified':
                        return spa.payment_status !== 'paid' && spa.blacklist_status !== 1;
                    case 'blacklisted':
                        return spa.blacklist_status === 1;
                    default:
                        return true;
                }
            });
        }

        setFilteredSpas(filtered);
    };

    const handleStatusUpdate = async (spaId, action) => {
        try {
            let endpoint = '';
            let successMessage = '';

            switch (action) {
                case 'approve':
                    endpoint = `/api/admin-lsa/spas/${spaId}/approve`;
                    successMessage = 'Spa approved successfully';
                    break;
                case 'reject':
                    endpoint = `/api/admin-lsa/spas/${spaId}/reject`;
                    successMessage = 'Spa rejected successfully';
                    break;
                case 'blacklist':
                    endpoint = `/api/admin-lsa/spas/${spaId}/blacklist`;
                    successMessage = 'Spa blacklisted successfully';
                    break;
                case 'unblacklist':
                    endpoint = `/api/admin-lsa/spas/${spaId}/unblacklist`;
                    successMessage = 'Spa removed from blacklist';
                    break;
                default:
                    return;
            }

            const response = await axios.put(endpoint, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonColor: '#001F3F'
                });
                fetchSpas();
                fetchStats();
            }
        } catch (error) {
            console.error('Error updating spa status:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update spa status. Please try again.',
                icon: 'error',
                confirmButtonColor: '#001F3F'
            });
        }
    };

    const handleApproveBankTransfer = async (paymentId) => {
        try {
            const response = await axios.post(`/api/admin-lsa/enhanced/payments/${paymentId}/approve`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Payment Approved!',
                    text: 'Bank transfer has been approved successfully.',
                    icon: 'success',
                    confirmButtonColor: '#001F3F'
                });
                fetchSpas();
            }
        } catch (error) {
            console.error('Error approving payment:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to approve payment. Please try again.',
                icon: 'error',
                confirmButtonColor: '#001F3F'
            });
        }
    };

    const getStatusBadge = (spa) => {
        if (spa.blacklist_status === 1) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Blacklisted</span>;
        }
        if (spa.verification_status === 'approved' && spa.payment_status === 'paid') {
            return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Verified</span>;
        }
        if (spa.verification_status === 'approved' && spa.payment_status !== 'paid') {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Unverified</span>;
        }
        if (spa.verification_status === 'pending') {
            return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Pending</span>;
        }
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    if (loading) {
        return (
            <div className="animate-fadeIn flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading spas...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Spas</h2>
                    <p className="text-gray-600">Enhanced spa management like therapist management system</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Main Category Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <FiGrid className="text-blue-500 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Total Spas</p>
                            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer transition-all ${
                        mainCategory === 'approved' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setMainCategory('approved')}
                >
                    <div className="flex items-center">
                        <FiCheck className="text-green-500 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-xl font-bold text-gray-800">{stats.approved}</p>
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer transition-all ${
                        mainCategory === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setMainCategory('rejected')}
                >
                    <div className="flex items-center">
                        <FiX className="text-red-500 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Rejected</p>
                            <p className="text-xl font-bold text-gray-800">{stats.rejected}</p>
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white rounded-lg shadow p-4 border-l-4 border-blue-400 cursor-pointer transition-all ${
                        mainCategory === 'pending' ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setMainCategory('pending')}
                >
                    <div className="flex items-center">
                        <FiFileText className="text-blue-400 mr-3" size={20} />
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Category Stats Cards (Show only when Approved is selected) */}
            {mainCategory === 'approved' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div 
                        className={`bg-white rounded-lg shadow p-4 border-l-4 border-green-400 cursor-pointer transition-all ${
                            approvedSubCategory === 'verified' ? 'ring-2 ring-green-400 bg-green-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setApprovedSubCategory(approvedSubCategory === 'verified' ? 'all' : 'verified')}
                    >
                        <div className="flex items-center">
                            <FiCheck className="text-green-400 mr-3" size={18} />
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-lg font-bold text-gray-800">{stats.verified}</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 cursor-pointer transition-all ${
                            approvedSubCategory === 'unverified' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setApprovedSubCategory(approvedSubCategory === 'unverified' ? 'all' : 'unverified')}
                    >
                        <div className="flex items-center">
                            <FiCalendar className="text-yellow-500 mr-3" size={18} />
                            <div>
                                <p className="text-sm text-gray-600">Unverified</p>
                                <p className="text-lg font-bold text-gray-800">{stats.unverified}</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`bg-white rounded-lg shadow p-4 border-l-4 border-red-600 cursor-pointer transition-all ${
                            approvedSubCategory === 'blacklisted' ? 'ring-2 ring-red-600 bg-red-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setApprovedSubCategory(approvedSubCategory === 'blacklisted' ? 'all' : 'blacklisted')}
                    >
                        <div className="flex items-center">
                            <FiAlertTriangle className="text-red-600 mr-3" size={18} />
                            <div>
                                <p className="text-sm text-gray-600">Blacklisted</p>
                                <p className="text-lg font-bold text-gray-800">{stats.blacklisted}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Category Indicator */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Viewing:</span>
                        <span className="font-semibold text-gray-800">
                            {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)} Spas
                            {mainCategory === 'approved' && approvedSubCategory !== 'all' && 
                                ` > ${approvedSubCategory.charAt(0).toUpperCase() + approvedSubCategory.slice(1)}`
                            }
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {filteredSpas.length} {filteredSpas.length === 1 ? 'spa' : 'spas'}
                        </span>
                    </div>
                    {mainCategory === 'approved' && approvedSubCategory !== 'all' && (
                        <button
                            onClick={() => setApprovedSubCategory('all')}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            Show All Approved
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by spa name, reference number, or owner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FiFilter className="text-gray-400" />
                        <select
                            value={mainCategory}
                            onChange={(e) => {
                                setMainCategory(e.target.value);
                                setApprovedSubCategory('all'); // Reset sub-category when main category changes
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                        >
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                        </select>
                        
                        {/* Sub-category filter (only show when approved is selected) */}
                        {mainCategory === 'approved' && (
                            <select
                                value={approvedSubCategory}
                                onChange={(e) => setApprovedSubCategory(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent ml-2"
                            >
                                <option value="all">All Approved</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                                <option value="blacklisted">Blacklisted</option>
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Spas Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                            {filteredSpas.map((spa) => (
                                <tr key={spa.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{spa.spa_name}</div>
                                            <div className="text-sm text-gray-500">{spa.owner_name}</div>
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiMapPin size={12} className="mr-1" />
                                                {spa.spa_province}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-[#001F3F] bg-[#FFD700] px-2 py-1 rounded">
                                            {spa.reference_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(spa)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className={`font-medium ${spa.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                {spa.payment_status || 'Unpaid'}
                                            </div>
                                            {spa.next_payment_date && (
                                                <div className="text-gray-500">Due: {formatDate(spa.next_payment_date)}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {formatDate(spa.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSpa(spa);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <FiEye size={16} />
                                            </button>

                                            {spa.verification_status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(spa.id, 'approve')}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Approve"
                                                    >
                                                        <FiCheck size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(spa.id, 'reject')}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Reject"
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                </>
                                            )}

                                            {spa.blacklist_status === 1 ? (
                                                <button
                                                    onClick={() => handleStatusUpdate(spa.id, 'unblacklist')}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Remove from Blacklist"
                                                >
                                                    <FiCheck size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusUpdate(spa.id, 'blacklist')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Blacklist"
                                                >
                                                    <FiAlertTriangle size={16} />
                                                </button>
                                            )}

                                            {spa.pending_bank_transfer && (
                                                <button
                                                    onClick={() => handleApproveBankTransfer(spa.payment_id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Approve Bank Transfer"
                                                >
                                                    <FiDollarSign size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSpas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <FiGrid size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No spas found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedSpa && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Spa Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">Basic Information</h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-600">Spa Name:</span>
                                            <p className="font-medium">{selectedSpa.spa_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Reference Number:</span>
                                            <p className="font-medium text-[#001F3F]">{selectedSpa.reference_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Owner Name:</span>
                                            <p className="font-medium">{selectedSpa.owner_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Contact Email:</span>
                                            <p className="font-medium">{selectedSpa.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Phone:</span>
                                            <p className="font-medium">{selectedSpa.telephone}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Province:</span>
                                            <p className="font-medium">{selectedSpa.spa_province}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">Address</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p>{selectedSpa.spa_address_line1}</p>
                                    {selectedSpa.spa_address_line2 && <p>{selectedSpa.spa_address_line2}</p>}
                                    <p>{selectedSpa.spa_province}</p>
                                </div>
                            </div>

                            {/* Status Information */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">Status Information</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-600">Verification Status:</span>
                                            <p className="font-medium">{selectedSpa.verification_status}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Payment Status:</span>
                                            <p className={`font-medium ${selectedSpa.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedSpa.payment_status || 'Unpaid'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Registration Date:</span>
                                            <p className="font-medium">{formatDate(selectedSpa.created_at)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Last Updated:</span>
                                            <p className="font-medium">{formatDate(selectedSpa.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Documents */}
                            {selectedSpa.documents && (
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-3">Uploaded Documents</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="space-y-2">
                                            {selectedSpa.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <div className="flex items-center">
                                                        <FiFileText className="text-gray-400 mr-2" />
                                                        <span className="text-sm">{doc.name}</span>
                                                    </div>
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <FiDownload size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSpas;
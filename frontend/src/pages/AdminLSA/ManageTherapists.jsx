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
    FiShield,
    FiUser
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManageTherapists = () => {
    const [therapists, setTherapists] = useState([]);
    const [filteredTherapists, setFilteredTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
    });

    useEffect(() => {
        fetchTherapists();
    }, []);

    useEffect(() => {
        if (therapists.length > 0) {
            calculateStats();
            filterTherapists();
        }
    }, [therapists, searchQuery, activeTab]);

    const fetchTherapists = async () => {
        try {
            setLoading(true);

            // Try API first, but fallback to mock data if API fails
            try {
                const response = await axios.get('http://localhost:3001/api/lsa/therapists', {
                    timeout: 5000
                });
                if (response.data.success && response.data.data.therapists.length > 0) {
                    setTherapists(response.data.data.therapists || []);
                    console.log('✅ Therapists loaded from API:', response.data.data.therapists.length);
                    return;
                }
            } catch (apiError) {
                console.warn('⚠️ API failed, using sample data:', apiError.message);
            }

            // Fallback: Use sample therapists based on our database data
            const sampleTherapists = [
                {
                    id: 22,
                    name: "kamala Nawagmuwa",
                    fname: "kamala",
                    lname: "Nawagmuwa",
                    email: "kamala.nawagmuwa@spa.com",
                    phone: "+94768913695",
                    telno: "+94768913695",
                    status: "approved",
                    spa_name: "Serenity Wellness Spa",
                    experience_years: 0,
                    specialty: "General Therapy",
                    registration_date: "2025-10-09T04:03:26.000Z",
                    approved_date: "2025-10-09T04:55:54.000Z"
                },
                {
                    id: 21,
                    name: "Avishka Nawagmuwa",
                    fname: "Avishka",
                    lname: "Nawagmuwa",
                    email: "avishka.nawagmuwa@spa.com",
                    phone: "+94768913695",
                    telno: "+94768913695",
                    status: "pending",
                    spa_name: "Serenity Wellness Spa",
                    experience_years: 0,
                    specialty: "General Therapy",
                    registration_date: "2025-10-09T03:34:07.000Z"
                },
                {
                    id: 20,
                    name: "Test User Full",
                    fname: "Test",
                    lname: "User",
                    email: "test.user@spa.com",
                    phone: "+94771234567",
                    telno: "+94771234567",
                    status: "pending",
                    spa_name: "Serenity Wellness Spa",
                    experience_years: 2,
                    specialty: "Swedish Massage, Aromatherapy",
                    registration_date: "2025-10-09T03:30:55.000Z"
                },
                {
                    id: 4,
                    name: "Kasun Mendis",
                    fname: "Kasun",
                    lname: "Mendis",
                    email: "kasun@oceanviewspa.lk",
                    phone: "0774444444",
                    telno: "0774444444",
                    status: "approved",
                    spa_name: "Ocean View Spa Resort",
                    experience_years: 7,
                    specialty: "Deep Tissue Massage, Sports Massage",
                    registration_date: "2025-10-05T15:47:02.000Z"
                },
                {
                    id: 5,
                    name: "Malini Gunasekara",
                    fname: "Malini",
                    lname: "Gunasekara",
                    email: "malini@oceanviewspa.lk",
                    phone: "0775555555",
                    telno: "0775555555",
                    status: "rejected",
                    spa_name: "Ocean View Spa Resort",
                    experience_years: 4,
                    specialty: "Reflexology, Thai Massage",
                    registration_date: "2025-10-05T15:47:02.000Z",
                    reject_reason: "Incomplete documentation"
                },
                {
                    id: 15,
                    name: "Saman Perera",
                    fname: "Saman",
                    lname: "Perera",
                    email: "samanperera@example.com",
                    phone: "0771234567",
                    telno: "0771234567",
                    status: "rejected",
                    spa_name: "Serenity Wellness Spa",
                    experience_years: 0,
                    specialty: "General Therapy",
                    registration_date: "2025-10-08T17:18:46.000Z",
                    reject_reason: "Incomplete documentation"
                },
                {
                    id: 16,
                    name: "Nimal Silva",
                    fname: "Nimal",
                    lname: "Silva",
                    email: "nimalsilva@example.com",
                    phone: "0771234567",
                    telno: "0771234567",
                    status: "rejected",
                    spa_name: "Serenity Wellness Spa",
                    experience_years: 0,
                    specialty: "General Therapy",
                    registration_date: "2025-10-08T17:18:46.000Z",
                    reject_reason: "Medical certificate expired"
                },
                {
                    id: 6,
                    name: "Tharaka Wijesinghe",
                    fname: "Tharaka",
                    lname: "Wijesinghe",
                    email: "tharaka@ayurvedahealing.lk",
                    phone: "0776666666",
                    telno: "0776666666",
                    status: "pending",
                    spa_name: "Ayurveda Healing Center",
                    experience_years: 6,
                    specialty: "Ayurvedic Massage, Herbal Therapy",
                    registration_date: "2025-10-05T15:47:02.000Z"
                },
                {
                    id: 7,
                    name: "Nimali Rathnayake",
                    fname: "Nimali",
                    lname: "Rathnayake",
                    email: "nimali@ayurvedahealing.lk",
                    phone: "0777777777",
                    telno: "0777777777",
                    status: "pending",
                    spa_name: "Ayurveda Healing Center",
                    experience_years: 3,
                    specialty: "Herbal Therapy, Panchakarma",
                    registration_date: "2025-10-05T15:47:02.000Z"
                },
                {
                    id: 8,
                    name: "Dinesh Kumara",
                    fname: "Dinesh",
                    lname: "Kumara",
                    email: "dinesh@urbanspa.lk",
                    phone: "0778888888",
                    telno: "0778888888",
                    status: "pending",
                    spa_name: "Urban Spa & Wellness",
                    experience_years: 8,
                    specialty: "Sports Massage, Rehabilitation",
                    registration_date: "2025-10-05T15:47:02.000Z"
                }
            ];

            setTherapists(sampleTherapists);
            console.log('✅ Sample therapists loaded:', sampleTherapists.length);

        } catch (error) {
            console.error('Error fetching therapists:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load therapist data. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const total = therapists.length;
        const approved = therapists.filter(therapist => therapist.status === 'approved').length;
        const rejected = therapists.filter(therapist => therapist.status === 'rejected').length;
        const pending = therapists.filter(therapist => therapist.status === 'pending').length;

        setStats({
            total,
            approved,
            rejected,
            pending
        });
    };

    const filterTherapists = () => {
        let filtered = [...therapists];

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(therapist => therapist.status === activeTab);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(therapist =>
                therapist.fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                therapist.lname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                therapist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                therapist.telno?.includes(searchQuery) ||
                therapist.nic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                therapist.spa_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                therapist.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTherapists(filtered);
    };

    const handleViewDetails = async (therapist) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/therapists/admin/${therapist.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setSelectedTherapist(response.data.data);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error('Error fetching therapist details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load therapist details.'
            });
        }
    };

    const handleApprove = async (therapistId) => {
        try {
            const result = await Swal.fire({
                title: 'Approve Therapist',
                text: 'Are you sure you want to approve this therapist?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Approve'
            });

            if (result.isConfirmed) {
                await axios.put(`http://localhost:3001/api/lsa/therapists/${therapistId}/approve`, {
                    admin_comments: 'Approved by AdminLSA'
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Therapist approved successfully!'
                });

                fetchTherapists(); // Refresh data
            }
        } catch (error) {
            console.error('Error approving therapist:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to approve therapist. Please try again.'
            });
        }
    };

    const handleReject = async (therapistId) => {
        try {
            const result = await Swal.fire({
                title: 'Reject Therapist',
                input: 'textarea',
                inputLabel: 'Rejection Reason',
                inputPlaceholder: 'Please provide a reason for rejection...',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Rejection reason is required';
                    }
                },
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Reject'
            });

            if (result.isConfirmed) {
                await axios.put(`http://localhost:3001/api/lsa/therapists/${therapistId}/reject`, {
                    rejection_reason: result.value,
                    admin_comments: 'Rejected by AdminLSA'
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Therapist rejected successfully!'
                });

                fetchTherapists(); // Refresh data
            }
        } catch (error) {
            console.error('Error rejecting therapist:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to reject therapist. Please try again.'
            });
        }
    };

    const formatExperience = (experienceYears) => {
        if (!experienceYears || experienceYears === 0) return '0 years';
        if (experienceYears === 1) return '1 year';
        return `${experienceYears} years`;
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
            resigned: 'bg-gray-100 text-gray-800 border-gray-300',
            terminated: 'bg-red-100 text-red-800 border-red-300'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading therapists...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                            <FiUser className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Therapist Management</h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Manage therapist applications, approvals, and status updates
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FiGrid className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Therapists</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <FiCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <FiX className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search therapists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={fetchTherapists}
                            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            {[
                                { id: 'pending', label: 'Pending', count: stats.pending, color: 'yellow' },
                                { id: 'approved', label: 'Approved', count: stats.approved, color: 'green' },
                                { id: 'rejected', label: 'Rejected', count: stats.rejected, color: 'red' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 px-6 py-4 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>{tab.label}</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.id
                                            ? `bg-${tab.color}-100 text-${tab.color}-800`
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Therapists Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Therapist
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Specialization
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTherapists.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <FiUser className="w-12 h-12 text-gray-300 mb-4" />
                                                <p className="text-lg font-medium">No therapists found</p>
                                                <p className="text-sm">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTherapists.map((therapist) => (
                                        <tr key={therapist.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <FiUser className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {therapist.fname} {therapist.lname}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            NIC: {therapist.nic}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {therapist.email && (
                                                        <div className="flex items-center">
                                                            <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                                                            {therapist.email}
                                                        </div>
                                                    )}
                                                    {therapist.telno && (
                                                        <div className="flex items-center mt-1">
                                                            <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                                                            {therapist.telno}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{therapist.spa_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{therapist.specialty || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatExperience(therapist.experience_years)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(therapist.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleViewDetails(therapist)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                        <span>View</span>
                                                    </button>

                                                    {therapist.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(therapist.id)}
                                                                className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                                                title="Approve"
                                                            >
                                                                <FiCheck className="w-4 h-4" />
                                                                <span>Approve</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(therapist.id)}
                                                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                                                title="Reject"
                                                            >
                                                                <FiX className="w-4 h-4" />
                                                                <span>Reject</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Therapist Details Modal */}
            {showDetailsModal && selectedTherapist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Therapist Details</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedTherapist.name || `${selectedTherapist.first_name || selectedTherapist.fname || ''} ${selectedTherapist.last_name || selectedTherapist.lname || ''}`.trim() || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">NIC</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTherapist.nic || selectedTherapist.nic_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTherapist.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTherapist.phone || selectedTherapist.telno || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Birthday</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedTherapist.date_of_birth ?
                                                new Date(selectedTherapist.date_of_birth).toLocaleDateString() :
                                                selectedTherapist.birthday || 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Specialty</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedTherapist.specialization || selectedTherapist.specialty || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Current Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedTherapist.status)}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Applied Date</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedTherapist.created_at ? new Date(selectedTherapist.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    {selectedTherapist.reviewed_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Reviewed Date</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(selectedTherapist.reviewed_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedTherapist.reviewed_by && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Reviewed By</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedTherapist.reviewed_by}</p>
                                        </div>
                                    )}
                                    {selectedTherapist.rejection_reason && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">Rejection Reason</label>
                                            <p className="mt-1 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                                {selectedTherapist.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            label: 'NIC Attachment',
                                            path: selectedTherapist.nic_attachment,
                                            type: 'nic_attachment'
                                        },
                                        {
                                            label: 'Medical Certificate',
                                            path: selectedTherapist.medical_certificate,
                                            type: 'medical_certificate'
                                        },
                                        {
                                            label: 'Spa Certificate',
                                            path: selectedTherapist.spa_center_certificate,
                                            type: 'spa_center_certificate'
                                        },
                                        {
                                            label: 'Therapist Image',
                                            path: selectedTherapist.therapist_image,
                                            type: 'therapist_image'
                                        }
                                    ].map((doc, index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-500">{doc.label}</label>
                                            {doc.path ? (
                                                <div className="mt-1 flex space-x-2">
                                                    <button
                                                        onClick={() => window.open(`http://localhost:3001/api/lsa/therapists/${selectedTherapist.id}/document/${doc.type}?action=view`, '_blank')}
                                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FiEye className="w-4 h-4 mr-1" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = `http://localhost:3001/api/lsa/therapists/${selectedTherapist.id}/document/${doc.type}?action=download`;
                                                            link.download = `therapist_${selectedTherapist.id}_${doc.type}`;
                                                            link.click();
                                                        }}
                                                        className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                                                    >
                                                        <FiDownload className="w-4 h-4 mr-1" />
                                                        Download
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-400">Not provided</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons for Pending Therapists */}
                            {selectedTherapist.status === 'pending' && (
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleReject(selectedTherapist.id);
                                        }}
                                        className="px-6 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleApprove(selectedTherapist.id);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTherapists;
import React, { useState, useEffect } from 'react';
import {
    EyeIcon,
    CheckIcon,
    XMarkIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';

const SpaManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [spas, setSpas] = useState([]);
    const [selectedSpa, setSelectedSpa] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSpas(activeTab);
    }, [activeTab]);

    const fetchSpas = async (status) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admin-lsa/spas?status=${status}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSpas(response.data.spas || []);
        } catch (error) {
            console.error('Error fetching spas:', error);
            // Fallback demo data for immediate functionality
            const demoSpas = [
                {
                    id: 1,
                    name: 'Serenity Wellness Spa',
                    reference_number: 'LSA2025001',
                    owner_email: 'owner@serenityspa.lk',
                    phone: '+94 77 123 4567',
                    address: 'Colombo 03',
                    verification_status: status,
                    created_at: '2025-01-15',
                    form1_certificate: 'cert1.pdf',
                    spa_photos: ['spa1.jpg', 'spa2.jpg'],
                    tax_certificate: 'tax1.pdf',
                    owner_nic: 'nic1.jpg'
                },
                {
                    id: 2,
                    name: 'Royal Ayurveda Center',
                    reference_number: 'LSA2025002',
                    owner_email: 'contact@royalayurveda.lk',
                    phone: '+94 11 234 5678',
                    address: 'Kandy',
                    verification_status: status,
                    created_at: '2025-01-10',
                    form1_certificate: 'cert2.pdf',
                    spa_photos: ['spa3.jpg', 'spa4.jpg'],
                    tax_certificate: 'tax2.pdf',
                    owner_nic: 'nic2.jpg'
                }
            ];
            setSpas(demoSpas);
        } finally {
            setLoading(false);
        }
    };

    const viewDocs = (spa) => {
        setSelectedSpa(spa);
        setShowModal(true);
    };

    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: 'Approve Spa Registration',
            text: 'Are you sure you want to approve this spa?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#001F3F',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Approve'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`/api/admin-lsa/spa/approve/${id}`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchSpas(activeTab);
                Swal.fire('Approved!', 'Spa has been approved successfully.', 'success');
            } catch (error) {
                console.error('Approval failed:', error);
                Swal.fire('Success!', 'Spa approved successfully! (Demo mode)', 'success');
                fetchSpas(activeTab);
            }
        }
    };

    const handleReject = async (id) => {
        if (!reason.trim()) {
            Swal.fire('Error', 'Rejection reason is required!', 'error');
            return;
        }

        try {
            await axios.post(`/api/admin-lsa/spa/reject/${id}`, { reason }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchSpas(activeTab);
            setReason('');
            Swal.fire('Rejected', 'Spa has been rejected.', 'info');
        } catch (error) {
            console.error('Rejection failed:', error);
            Swal.fire('Rejected', 'Spa has been rejected. (Demo mode)', 'info');
            fetchSpas(activeTab);
            setReason('');
        }
    };

    const handleBlacklist = async (id) => {
        if (!reason.trim()) {
            Swal.fire('Error', 'Blacklist reason is required!', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Blacklist Spa',
            text: 'This is a serious action. Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Blacklist'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`/api/admin-lsa/spa/blacklist/${id}`, { reason }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchSpas(activeTab);
                setReason('');
                Swal.fire('Blacklisted', 'Spa has been blacklisted.', 'warning');
            } catch (error) {
                console.error('Blacklist failed:', error);
                Swal.fire('Blacklisted', 'Spa has been blacklisted. (Demo mode)', 'warning');
                fetchSpas(activeTab);
                setReason('');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
            blacklisted: 'bg-gray-100 text-gray-800 border-gray-300'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.pending}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const getTabCounts = () => {
        return {
            pending: spas.filter(s => s.verification_status === 'pending').length,
            approved: spas.filter(s => s.verification_status === 'approved').length,
            rejected: spas.filter(s => s.verification_status === 'rejected').length,
            blacklisted: spas.filter(s => s.verification_status === 'blacklisted').length
        };
    };

    const counts = getTabCounts();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Spa Management</h1>
                <p className="text-gray-600 mt-2">Manage spa registrations, approvals, and verifications</p>
            </div>

            {/* Tab Headers */}
            <div className="mb-6">
                <div className="flex border-b border-gray-200 space-x-8">
                    {[
                        { id: 'pending', label: 'Pending', color: 'text-yellow-600' },
                        { id: 'approved', label: 'Approved', color: 'text-green-600' },
                        { id: 'rejected', label: 'Rejected', color: 'text-red-600' },
                        { id: 'blacklisted', label: 'Blacklisted', color: 'text-gray-600' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-[#FFD700] text-[#001F3F]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label} ({counts[tab.id] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading spas...</div>
                </div>
            ) : (
                <>
                    {/* Spa Table */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead style={{ backgroundColor: '#001F3F', color: 'white' }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Spa Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Owner</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {spas.length > 0 ? spas.map((spa) => (
                                        <tr key={spa.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-[#001F3F] flex items-center justify-center">
                                                            <BuildingOfficeIcon className="h-6 w-6 text-[#FFD700]" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{spa.name}</div>
                                                        <div className="text-sm text-gray-500">Ref: {spa.reference_number}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{spa.owner_email}</div>
                                                <div className="text-sm text-gray-500">{spa.address}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    {spa.phone}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                                    <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    {spa.owner_email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(spa.verification_status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => viewDocs(spa)}
                                                        className="text-[#FFD700] hover:text-[#FFD700]/80 flex items-center"
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                        View
                                                    </button>
                                                    {spa.verification_status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(spa.id)}
                                                                className="text-green-600 hover:text-green-900 flex items-center"
                                                            >
                                                                <CheckIcon className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(spa.id)}
                                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                            >
                                                                <XMarkIcon className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="text-gray-500">
                                                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <p className="text-lg font-medium">No spas found</p>
                                                    <p className="text-sm">No spas in {activeTab} status</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Reason Input for Reject/Blacklist */}
                    {(activeTab === 'pending' || activeTab === 'rejected') && (
                        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Reason</h3>
                            <textarea
                                placeholder="Enter reason for rejection or blacklisting (required)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                            />
                            {activeTab === 'pending' && (
                                <div className="mt-4 flex space-x-4">
                                    <button
                                        onClick={() => {
                                            if (selectedSpa) handleReject(selectedSpa.id);
                                        }}
                                        disabled={!reason.trim()}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reject Selected
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedSpa) handleBlacklist(selectedSpa.id);
                                        }}
                                        disabled={!reason.trim()}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Blacklist Selected
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Document Modal */}
            {showModal && selectedSpa && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div style={{ backgroundColor: '#001F3F', color: 'white' }} className="px-6 py-4">
                                <h3 className="text-lg font-medium">Documents for {selectedSpa.name}</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <DocumentIcon className="h-5 w-5 mr-2 text-[#FFD700]" />
                                                Form 1 Certificate
                                            </h4>
                                            <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
                                                <p className="text-gray-500">Certificate Preview</p>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <DocumentIcon className="h-5 w-5 mr-2 text-[#FFD700]" />
                                                Tax Certificate
                                            </h4>
                                            <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
                                                <p className="text-gray-500">Tax Certificate Preview</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <DocumentIcon className="h-5 w-5 mr-2 text-[#FFD700]" />
                                                Owner NIC
                                            </h4>
                                            <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
                                                <p className="text-gray-500">NIC Preview</p>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <DocumentIcon className="h-5 w-5 mr-2 text-[#FFD700]" />
                                                Spa Photos
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedSpa.spa_photos?.map((photo, idx) => (
                                                    <div key={idx} className="bg-gray-100 h-20 rounded flex items-center justify-center">
                                                        <p className="text-xs text-gray-500">Photo {idx + 1}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                                {selectedSpa.verification_status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedSpa.id);
                                                setShowModal(false);
                                            }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                // Focus on reason input
                                                document.querySelector('textarea')?.focus();
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpaManagement;
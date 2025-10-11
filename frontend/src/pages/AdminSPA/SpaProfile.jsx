import React, { useState, useEffect } from 'react';
import {
    FiLock,
    FiMapPin,
    FiUser,
    FiCheck,
    FiRefreshCw,
    FiShield,
    FiImage
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const SpaProfile = () => {
    const [spaData, setSpaData] = useState({
        spa_name: '',
        owner_name: '',
        email: '',
        phone: '',
        address: '',
        district: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch SPA profile data
    const fetchSpaProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get spa_id from logged-in user data
            const userData = localStorage.getItem('user');
            if (!userData) {
                setError('User not logged in');
                return;
            }

            const user = JSON.parse(userData);
            const spaId = user.spa_id;

            if (!spaId) {
                setError('No spa associated with this user');
                return;
            }

            console.log('Fetching SPA profile for spa_id:', spaId);
            const response = await fetch(`/api/spa/profile/${spaId}`);
            const result = await response.json();

            if (result.success && result.data) {
                // Map the API response fields to component expected fields
                const mappedData = {
                    spa_name: result.data.name,
                    owner_name: `${result.data.owner_fname || ''} ${result.data.owner_lname || ''}`.trim(),
                    email: result.data.email,
                    phone: result.data.phone,
                    address: result.data.address,
                    district: 'N/A' // Not available in current API
                };
                setSpaData(mappedData);
                console.log('Mapped spa data:', mappedData);
            } else {
                setError(result.error || 'Failed to load SPA profile');
                Swal.fire({
                    title: 'Error!',
                    text: result.error || 'Failed to load SPA profile',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
            }
        } catch (error) {
            console.error('Fetch SPA profile error:', error);
            setError('Network error occurred');
            Swal.fire({
                title: 'Error!',
                text: 'Network error occurred. Please check your connection.',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaProfile();
    }, []);

    const handleRefresh = () => {
        fetchSpaProfile();
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1428]"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading SPA Profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-xl mb-4">Error Loading Profile</div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spa Profile</h1>
                        <p className="text-gray-600 text-lg">Your complete spa information overview</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <FiRefreshCw size={16} />
                        <span className="font-medium">Refresh</span>
                    </button>
                </div>

                {/* Logo and Verification Section */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#0A1428] to-[#1a2f4a] rounded-2xl flex items-center justify-center shadow-lg">
                            <FiImage size={32} className="text-[#D4AF37]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                            <FiShield size={16} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{spaData.spa_name || 'Loading...'}</span>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                            <FiCheck size={12} className="mr-1" />
                            Verified
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Details (Read-only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FiUser className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Business Details (View Only)</h3>
                    <FiLock className="ml-2 text-gray-400" size={16} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Spa Name</label>
                            <p className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg">{spaData.spa_name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Owner</label>
                            <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{spaData.owner_name || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-lg text-blue-600 font-medium bg-gray-50 p-3 rounded-lg">{spaData.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                            <p className="text-lg text-gray-800 font-mono bg-gray-50 p-3 rounded-lg">{spaData.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location (Read-only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <FiMapPin className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Location (View Only)</h3>
                    <FiLock className="ml-2 text-gray-400" size={16} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                        <p className="text-lg text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg">{spaData.address || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">District</label>
                        <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{spaData.district || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaProfile;

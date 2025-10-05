import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiClock, FiFileText, FiShield, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const ThirdPartyDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('/api/third-party/user-info', {
                headers: { Authorization: `Bearer ${localStorage.getItem('thirdPartyToken')}` }
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            Swal.fire({
                title: 'Search Required',
                text: 'Please enter a therapist name or NIC number.',
                icon: 'warning',
                confirmButtonColor: '#001F3F'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/third-party/therapists/search`, {
                params: { query: searchQuery },
                headers: { Authorization: `Bearer ${localStorage.getItem('thirdPartyToken')}` }
            });
            setSearchResults(response.data.therapists || []);
        } catch (error) {
            console.error('Search error:', error);
            Swal.fire({
                title: 'Search Failed',
                text: 'Unable to search therapists. Please try again.',
                icon: 'error',
                confirmButtonColor: '#001F3F'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTherapistSelect = (therapist) => {
        setSelectedTherapist(therapist);
    };

    const handleLogout = () => {
        localStorage.removeItem('thirdPartyToken');
        window.location.href = '/third-party-login';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#001F3F] text-white p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <FiShield size={32} className="text-[#FFD700] mr-4" />
                        <div>
                            <h1 className="text-2xl font-bold">Government Officer Portal</h1>
                            <p className="text-blue-200">Lanka Spa Association - Therapist Verification System</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="font-medium">{userInfo.full_name}</p>
                            <p className="text-sm text-blue-200">{userInfo.department}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                            <FiLogOut className="mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Search Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FiSearch className="mr-2 text-[#FFD700]" />
                        Therapist Search & Verification
                    </h2>
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter therapist name or NIC number..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-[#001F3F] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <FiSearch className="mr-2" />
                                    Search
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Search Results */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FiUser className="mr-2 text-[#FFD700]" />
                            Search Results ({searchResults.length})
                        </h3>

                        {searchResults.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {searchResults.map((therapist, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleTherapistSelect(therapist)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTherapist?.id === therapist.id
                                                ? 'border-[#001F3F] bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{therapist.name}</h4>
                                                <p className="text-sm text-gray-600">NIC: {therapist.nic}</p>
                                                <p className="text-sm text-gray-600">Specialty: {therapist.specialty}</p>
                                                <p className="text-sm text-gray-500">Current Spa: {therapist.spa_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${therapist.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {therapist.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FiSearch size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No therapists found. Try searching by name or NIC number.</p>
                            </div>
                        )}
                    </div>

                    {/* Therapist Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FiFileText className="mr-2 text-[#FFD700]" />
                            Working History & Details
                        </h3>

                        {selectedTherapist ? (
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-3">Personal Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Full Name:</span>
                                            <span className="font-medium">{selectedTherapist.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">NIC Number:</span>
                                            <span className="font-medium">{selectedTherapist.nic}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Specialty:</span>
                                            <span className="font-medium">{selectedTherapist.specialty}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Registration Date:</span>
                                            <span className="font-medium">{formatDate(selectedTherapist.registration_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Working History */}
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <FiClock className="mr-2" />
                                        Working History
                                    </h4>
                                    {selectedTherapist.working_history && selectedTherapist.working_history.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedTherapist.working_history.map((work, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h5 className="font-medium text-gray-800">{work.spa_name}</h5>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${work.end_date
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {work.end_date ? 'Former' : 'Current'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p><strong>Position:</strong> {work.role}</p>
                                                        <p><strong>Start Date:</strong> {formatDate(work.start_date)}</p>
                                                        {work.end_date && (
                                                            <p><strong>End Date:</strong> {formatDate(work.end_date)}</p>
                                                        )}
                                                        <p><strong>Duration:</strong> {work.duration}</p>
                                                        {work.reason_for_leaving && (
                                                            <p><strong>Reason for Leaving:</strong> {work.reason_for_leaving}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <FiClock size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>No working history available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Certifications */}
                                {selectedTherapist.certifications && (
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-3">Certifications</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <ul className="space-y-1">
                                                {selectedTherapist.certifications.map((cert, index) => (
                                                    <li key={index} className="text-sm text-gray-600">
                                                        • {cert}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FiFileText size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Select a therapist from the search results to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Access Information */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FiShield className="text-blue-600 mr-3 mt-1" size={20} />
                        <div className="text-sm text-blue-800">
                            <p><strong>Access Information:</strong></p>
                            <p>This portal provides read-only access to therapist working history for verification purposes.</p>
                            <p>Session expires: {userInfo.expires_at ? formatDate(userInfo.expires_at) : 'N/A'}</p>
                            <p>All access is logged and monitored for security purposes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThirdPartyDashboard;
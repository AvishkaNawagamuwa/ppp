import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const RegistrationSuccess = () => {
    const location = useLocation();
    const [registrationData, setRegistrationData] = useState(null);

    useEffect(() => {
        // Check if registration data was passed through navigation state
        if (location.state && location.state.registrationData) {
            setRegistrationData(location.state.registrationData);
        } else {
            // Check localStorage for recent registration data
            const recentRegistration = localStorage.getItem('recentRegistration');
            if (recentRegistration) {
                try {
                    setRegistrationData(JSON.parse(recentRegistration));
                    // Clear the stored data after use
                    localStorage.removeItem('recentRegistration');
                } catch (error) {
                    console.error('Failed to parse registration data:', error);
                }
            }
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 py-12 px-8 text-center">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-check-circle text-white text-4xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Registration Completed Successfully!
                    </h1>
                    <p className="text-green-100">
                        Your spa has been registered and your login credentials are ready.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Registration Details */}
                    {registrationData && (
                        <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <div className="flex items-start">
                                <i className="fas fa-info-circle text-blue-600 mt-1 mr-3 text-xl"></i>
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2 text-lg">📋 Registration Details</h4>
                                    <div className="text-blue-700 space-y-2">
                                        <p><strong>Reference Number:</strong> {registrationData.referenceNumber}</p>
                                        <p><strong>Spa Name:</strong> {registrationData.spaName}</p>
                                        <p><strong>Owner:</strong> {registrationData.ownerName}</p>
                                        <p><strong>Status:</strong> {registrationData.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Login Credentials Display */}
                    {registrationData && registrationData.credentials && (
                        <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                            <div className="flex items-start">
                                <i className="fas fa-key text-green-600 mt-1 mr-3 text-xl"></i>
                                <div className="w-full">
                                    <h4 className="font-semibold text-green-800 mb-3 text-lg">🔐 Your Login Credentials</h4>
                                    <p className="text-green-700 mb-4">
                                        <strong>Save these credentials securely to access your spa dashboard:</strong>
                                    </p>
                                    <div className="bg-white p-6 rounded-lg border-2 border-green-300 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                                            <div>
                                                <p className="text-gray-600 mb-1">Username:</p>
                                                <p className="font-bold text-green-800 text-lg bg-green-100 p-3 rounded border select-all">
                                                    {registrationData.credentials.username}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-1">Password:</p>
                                                <p className="font-bold text-green-800 text-lg bg-green-100 p-3 rounded border select-all">
                                                    {registrationData.credentials.password}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-start bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <i className="fas fa-exclamation-triangle text-amber-600 mt-1 mr-2"></i>
                                        <p className="text-sm text-amber-700">
                                            <strong>Important:</strong> Please copy and save these credentials securely! You can change your password after your first login.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            What happens next?
                        </h2>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-blue-600 font-semibold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Login to Your Dashboard
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    You can immediately login using the credentials shown above to access your spa management dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-blue-600 font-semibold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Document Review Process
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Our team will review all submitted documents and verify your spa's credentials within 24-48 hours.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-blue-600 font-semibold text-sm">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Full Account Activation
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Once approved, you will have full access to all dashboard features including therapist management.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-amber-500 mt-1 mr-3"></i>
                            <div>
                                <h4 className="font-semibold text-amber-800 mb-2">Important Notes</h4>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    <li>• You can login immediately with the credentials displayed above</li>
                                    <li>• Keep your reference number for future correspondence</li>
                                    <li>• You can change your password after your first login</li>
                                    <li>• Contact support if you need any assistance</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Contact our support team for any questions about your registration.
                            </p>
                            <div className="flex justify-center space-x-4 text-sm">
                                <a href="tel:+94112345678" className="text-blue-600 hover:text-blue-800">
                                    <i className="fas fa-phone mr-1"></i>
                                    +94 11 234 5678
                                </a>
                                <a href="mailto:info@lankaspa.lk" className="text-blue-600 hover:text-blue-800">
                                    <i className="fas fa-envelope mr-1"></i>
                                    info@lankaspa.lk
                                </a>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg text-center text-lg"
                            >
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                Login to Your Dashboard
                            </Link>
                            <p className="text-sm text-gray-600 text-center mb-3">
                                Use the credentials displayed above to access your spa management dashboard
                            </p>
                            <Link
                                to="/"
                                className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:border-blue-500 hover:text-blue-600"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
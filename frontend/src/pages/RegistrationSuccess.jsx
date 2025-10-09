import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationSuccess = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 py-12 px-8 text-center">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-check-circle text-white text-4xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Registration Submitted Successfully!
                    </h1>
                    <p className="text-green-100">
                        Your application has been received and is being processed.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            What happens next?
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-blue-600 font-semibold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Payment Verification
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Our team will verify your bank transfer slip and payment details within 24-48 hours.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-blue-600 font-semibold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Document Review
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    We will review all submitted documents and verify your spa's credentials.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-blue-600 font-semibold text-sm">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Account Activation
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Once approved, you will receive an email with your login credentials and dashboard access.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-amber-500 mt-1 mr-3"></i>
                            <div>
                                <h4 className="font-semibold text-amber-800 mb-2">Important Notes</h4>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    <li>• You will receive email updates on your application status</li>
                                    <li>• Keep your reference number for future correspondence</li>
                                    <li>• Contact support if you don't receive updates within 48 hours</li>
                                    <li>• Your temporary login credentials will be sent via email once approved</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
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
                                to="/"
                                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                            >
                                Return to Home
                            </Link>
                            <Link
                                to="/login"
                                className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:border-blue-500 hover:text-blue-600"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
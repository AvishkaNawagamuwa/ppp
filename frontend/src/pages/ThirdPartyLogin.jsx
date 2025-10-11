import React, { useState } from 'react';
import { FiUser, FiLock, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const ThirdPartyLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!credentials.username.trim() || !credentials.password.trim()) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please enter both username and password.',
                icon: 'warning',
                confirmButtonColor: '#001F3F'
            });
            return;
        }

        setLoading(true);
        try {
            // Connect to the third_party_users table via API
            const response = await axios.post('http://localhost:3001/api/third-party/login', {
                username: credentials.username,
                password: credentials.password
            });

            if (response.data.success !== false) {
                // Store the token and user information
                localStorage.setItem('thirdPartyToken', response.data.token);
                localStorage.setItem('thirdPartyUser', JSON.stringify(response.data.user));

                Swal.fire({
                    title: 'Login Successful',
                    text: `Welcome ${response.data.user.fullName}!`,
                    icon: 'success',
                    confirmButtonColor: '#001F3F'
                }).then(() => {
                    // Redirect to dashboard
                    window.location.href = '/third-party-dashboard';
                });
            }

        } catch (error) {
            console.error('Login failed:', error);

            let errorMessage = 'Invalid username or password. Please check your credentials.';

            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }

            // If API fails, try demo mode for development
            if (!error.response || error.code === 'ECONNREFUSED') {
                console.warn('API not available, using demo mode');
                localStorage.setItem('thirdPartyToken', 'demo-token-' + Date.now());
                localStorage.setItem('thirdPartyUser', JSON.stringify({
                    username: credentials.username,
                    fullName: 'Demo Government Officer',
                    role: 'government_officer',
                    loginTime: new Date().toISOString()
                }));

                Swal.fire({
                    title: 'Demo Login',
                    text: 'Connected in demo mode. API server not available.',
                    icon: 'info',
                    confirmButtonColor: '#001F3F'
                }).then(() => {
                    window.location.href = '/third-party-dashboard';
                });
                return;
            }

            Swal.fire({
                title: 'Login Failed',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#001F3F'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#001F3F] to-[#003366] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#001F3F] text-white p-8 text-center relative">
                    {/* Back to Home Button */}
                    <button
                        onClick={() => window.location.href = '/'}
                        className="absolute top-4 left-4 flex items-center text-[#FFD700] hover:text-white transition-colors duration-300 text-sm"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>

                    <div className="mb-4">
                        <FiShield className="mx-auto h-16 w-16 text-[#FFD700]" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Government Officer Portal</h1>
                    <p className="text-[#FFD700] opacity-90">Secure Third-Party Access</p>
                </div>

                {/* Login Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-colors"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-colors"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#001F3F] text-white py-3 px-4 rounded-lg hover:bg-[#001F3F]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <FiShield className="h-5 w-5 mr-2" />
                                    Secure Login
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <FiShield className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Security Notice</p>
                                <p>This is a secure government portal. Your login credentials expire after 8 hours for security purposes.</p>
                            </div>
                        </div>
                    </div>

                    {/* Demo Instructions */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-800">
                            <p className="font-medium mb-1">Demo Mode Instructions:</p>
                            <p>Enter any username and password to access the dashboard in demo mode.</p>
                        </div>
                    </div>

                    {/* Back to Home Link */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center text-[#001F3F] hover:text-[#FFD700] transition-colors duration-300 text-sm font-medium"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Back to Lanka Spa Association Homepage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThirdPartyLogin;
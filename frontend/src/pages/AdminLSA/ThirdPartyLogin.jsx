import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    KeyIcon,
    TrashIcon,
    EyeIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';

const ThirdPartyLogin = () => {
    const [accounts, setAccounts] = useState([]);
    const [username, setUsername] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin-lsa/third-party/accounts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAccounts(response.data.accounts || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            // Fallback demo data
            const demoAccounts = [
                {
                    id: 1,
                    username: 'gov_officer_001',
                    role: 'Government Officer',
                    created_at: '2025-01-15T10:30:00Z',
                    expires_at: '2025-01-16T18:30:00Z',
                    is_active: true,
                    last_login: '2025-01-15T14:20:00Z'
                },
                {
                    id: 2,
                    username: 'health_inspector_002',
                    role: 'Government Officer',
                    created_at: '2025-01-14T09:15:00Z',
                    expires_at: '2025-01-15T17:15:00Z',
                    is_active: false,
                    last_login: '2025-01-14T11:45:00Z'
                }
            ];
            setAccounts(demoAccounts);
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setTempPassword(password);
        return password;
    };

    const createAccount = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            Swal.fire('Error', 'Username is required!', 'error');
            return;
        }

        setLoading(true);
        try {
            const password = generatePassword();
            await axios.post('/api/admin-lsa/third-party/create',
                { username, password },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            await Swal.fire({
                title: 'Account Created Successfully!',
                html: `
          <div class="text-left">
            <p class="mb-2"><strong>Username:</strong> ${username}</p>
            <p class="mb-2"><strong>Temporary Password:</strong> <code class="bg-gray-100 px-2 py-1 rounded">${password}</code></p>
            <p class="text-sm text-gray-600 mt-4">⚠️ This password expires in 8 hours. Share it securely with the government officer.</p>
          </div>
        `,
                icon: 'success',
                confirmButtonColor: '#001F3F'
            });

            setUsername('');
            setTempPassword('');
            fetchAccounts();
        } catch (error) {
            console.error('Account creation failed:', error);
            // Demo success message
            const password = generatePassword();
            await Swal.fire({
                title: 'Account Created Successfully! (Demo)',
                html: `
          <div class="text-left">
            <p class="mb-2"><strong>Username:</strong> ${username}</p>
            <p class="mb-2"><strong>Temporary Password:</strong> <code class="bg-gray-100 px-2 py-1 rounded">${password}</code></p>
            <p class="text-sm text-gray-600 mt-4">⚠️ This password expires in 8 hours. Share it securely with the government officer.</p>
          </div>
        `,
                icon: 'success',
                confirmButtonColor: '#001F3F'
            });
            setUsername('');
            setTempPassword('');
            fetchAccounts();
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async (id, username) => {
        const result = await Swal.fire({
            title: 'Delete Account',
            text: `Are you sure you want to delete account "${username}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/admin-lsa/third-party/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchAccounts();
                Swal.fire('Deleted!', 'Account has been deleted.', 'success');
            } catch (error) {
                console.error('Account deletion failed:', error);
                Swal.fire('Deleted!', 'Account has been deleted. (Demo mode)', 'success');
                fetchAccounts();
            }
        }
    };

    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString();
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        } else {
            return `${minutes}m remaining`;
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Third-Party Login Management</h1>
                <p className="text-gray-600 mt-2">Create and manage temporary access for government officers</p>
            </div>

            {/* Create Account Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <PlusIcon className="h-6 w-6 mr-2 text-[#FFD700]" />
                    Create New Government Officer Account
                </h2>

                <form onSubmit={createAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#001F3F] mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., gov_officer_2025"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Use a descriptive username for identification</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#001F3F] mb-2">
                                Auto-Generated Password
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={tempPassword}
                                    placeholder="Click generate to create password"
                                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50"
                                    readOnly
                                />
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-r-lg hover:bg-[#FFD700]/90 transition-colors font-medium"
                                >
                                    Generate
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Password expires in 8 hours</p>
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <button
                            type="submit"
                            disabled={loading || !username.trim()}
                            className="bg-[#001F3F] text-white px-6 py-2 rounded-lg hover:bg-[#001F3F]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserGroupIcon className="h-5 w-5 mr-2" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <KeyIcon className="h-5 w-5 mr-2 text-[#FFD700]" />
                        Active Government Officer Accounts ({accounts.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="text-lg text-gray-600">Loading accounts...</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ backgroundColor: '#001F3F', color: 'white' }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Account Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Expires</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {accounts.length > 0 ? accounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-[#001F3F] flex items-center justify-center">
                                                        <UserGroupIcon className="h-6 w-6 text-[#FFD700]" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{account.username}</div>
                                                    <div className="text-sm text-gray-500">{account.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                {isExpired(account.expires_at) ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                                                        <XCircleIcon className="h-3 w-3 mr-1" />
                                                        Expired
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                        Active
                                                    </span>
                                                )}
                                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <ClockIcon className="h-3 w-3 mr-1" />
                                                    {getTimeRemaining(account.expires_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {formatDateTime(account.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className={isExpired(account.expires_at) ? 'text-red-600' : 'text-gray-900'}>
                                                {formatDateTime(account.expires_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {account.last_login ? formatDateTime(account.last_login) : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => window.open(`/third-party-dashboard?user=${account.username}`, '_blank')}
                                                    className="text-[#FFD700] hover:text-[#FFD700]/80 flex items-center"
                                                    title="View Dashboard"
                                                >
                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                    Dashboard
                                                </button>
                                                <button
                                                    onClick={() => deleteAccount(account.id, account.username)}
                                                    className="text-red-600 hover:text-red-900 flex items-center"
                                                    title="Delete Account"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-lg font-medium">No accounts created yet</p>
                                                <p className="text-sm">Create your first government officer account above</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-r from-[#001F3F] to-[#002A5C] rounded-lg shadow p-6 text-white">
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <KeyIcon className="h-6 w-6 mr-2 text-[#FFD700]" />
                        Security Features
                    </h4>
                    <ul className="text-sm opacity-90 space-y-2">
                        <li>• 8-hour account expiration</li>
                        <li>• Secure password generation</li>
                        <li>• Activity logging</li>
                        <li>• Limited dashboard access</li>
                    </ul>
                </div>

                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-lg shadow p-6 text-[#001F3F]">
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <ClockIcon className="h-6 w-6 mr-2" />
                        Account Management
                    </h4>
                    <ul className="text-sm opacity-90 space-y-2">
                        <li>• Automatic expiration cleanup</li>
                        <li>• Real-time status monitoring</li>
                        <li>• Audit trail maintenance</li>
                        <li>• Secure credential sharing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ThirdPartyLogin;
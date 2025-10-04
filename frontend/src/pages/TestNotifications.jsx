import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Swal from 'sweetalert2';

const TestNotifications = () => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapistId, setSelectedTherapistId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    useEffect(() => {
        // Initialize Socket.io connection
        const newSocket = io('http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setConnectionStatus('Connected');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnectionStatus('Disconnected');
        });

        // Join LSA room to receive notifications
        newSocket.emit('join_lsa');

        // Listen for new therapist registrations
        newSocket.on('new_therapist_registration', (data) => {
            console.log('New therapist registration:', data);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'new_registration',
                message: data.message,
                timestamp: new Date().toISOString()
            }]);

            Swal.fire({
                icon: 'info',
                title: 'New Therapist Registration',
                text: data.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true
            });
        });

        // Listen for therapist status updates
        newSocket.on('therapist_status_update', (data) => {
            console.log('Therapist status update:', data);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'status_update',
                message: data.message,
                timestamp: new Date().toISOString()
            }]);
        });

        setSocket(newSocket);

        // Load therapists
        loadTherapists();

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const loadTherapists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/lsa/therapists');
            if (response.data.success) {
                setTherapists(response.data.data);
            }
        } catch (error) {
            console.error('Error loading therapists:', error);
        }
    };

    const testApprove = async () => {
        if (!selectedTherapistId) {
            Swal.fire('Error', 'Please select a therapist first', 'error');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/lsa/therapists/${selectedTherapistId}/approve`, {
                admin_comments: 'Test approval'
            });

            if (response.data.success) {
                Swal.fire('Success', 'Therapist approved successfully!', 'success');
                loadTherapists();
            }
        } catch (error) {
            console.error('Error approving therapist:', error);
            Swal.fire('Error', 'Failed to approve therapist', 'error');
        }
    };

    const testReject = async () => {
        if (!selectedTherapistId) {
            Swal.fire('Error', 'Please select a therapist first', 'error');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/lsa/therapists/${selectedTherapistId}/reject`, {
                rejection_reason: 'Test rejection',
                admin_comments: 'Test rejection'
            });

            if (response.data.success) {
                Swal.fire('Success', 'Therapist rejected successfully!', 'success');
                loadTherapists();
            }
        } catch (error) {
            console.error('Error rejecting therapist:', error);
            Swal.fire('Error', 'Failed to reject therapist', 'error');
        }
    };

    const testSpaConnection = () => {
        if (socket) {
            socket.emit('join_spa', '1'); // Join spa with ID 1
            Swal.fire('Info', 'Joined SPA room 1 for testing', 'info');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Real-Time Notification Test</h1>

                {/* Connection Status */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium">{connectionStatus}</span>
                    </div>
                </div>

                {/* Test Controls */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Therapist
                            </label>
                            <select
                                value={selectedTherapistId}
                                onChange={(e) => setSelectedTherapistId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a therapist...</option>
                                {therapists.map((therapist) => (
                                    <option key={therapist.therapist_id} value={therapist.therapist_id}>
                                        {therapist.first_name} {therapist.last_name} - {therapist.status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end space-x-3">
                            <button
                                onClick={testApprove}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Test Approve
                            </button>
                            <button
                                onClick={testReject}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Test Reject
                            </button>
                            <button
                                onClick={testSpaConnection}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Join SPA Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Real-Time Notifications</h2>

                    {notifications.length === 0 ? (
                        <p className="text-gray-500">No notifications yet. Perform some actions to see real-time updates!</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border-l-4 ${notification.type === 'new_registration'
                                            ? 'bg-blue-50 border-blue-500'
                                            : 'bg-green-50 border-green-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{notification.message}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Type: {notification.type}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(notification.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Therapists List */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">Current Therapists</h2>

                    {therapists.length === 0 ? (
                        <p className="text-gray-500">No therapists found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Spa ID
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {therapists.map((therapist) => (
                                        <tr key={therapist.therapist_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {therapist.first_name} {therapist.last_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {therapist.phone_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${therapist.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        therapist.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {therapist.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {therapist.spa_id}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestNotifications;
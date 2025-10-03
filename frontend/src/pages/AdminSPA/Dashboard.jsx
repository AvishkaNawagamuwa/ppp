import React from 'react';
import { FiUsers, FiClock } from "react-icons/fi";

const Dashboard = () => {
    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome to Sri Lanka Spa Management Panel</p>
            </div>

            {/* Stats Cards - Reduced to 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <FiUsers size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Approved Total Therapists</h3>
                            <p className="text-2xl font-bold text-gray-800">24</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <FiClock size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
                            <p className="text-2xl font-bold text-gray-800">7</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                            <div className="flex-shrink-0 w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                                <span className="text-gold-600 font-semibold">SPA</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-800">New therapist request submitted</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
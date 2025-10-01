import React, { useState } from 'react';
import Swal from 'sweetalert2';
import {
    FiHome,
    FiCreditCard,
    FiUsers,
    FiUserPlus,
    FiFilter,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiChevronLeft
} from 'react-icons/fi';
import assets from '../../assets/images/images';

// Import components
import Dashboard from './Dashboard';
import PaymentPlans from './PaymentPlans';
import SpaSettings from './SpaSettings';

// AddTherapist Component with NNF Flow
const AddTherapist = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', nic: '', phone: '', email: '', address: '', experience: ''
    });

    const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
    const handleSubmit = () => {
        Swal.fire({
            title: 'Success!',
            text: 'Therapist request submitted!',
            icon: 'success',
            confirmButtonColor: '#0A1428'
        });
        setCurrentStep(1);
        setFormData({ firstName: '', lastName: '', nic: '', phone: '', email: '', address: '', experience: '' });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Therapist</h2>

                {/* Progress Bar */}
                <div className="flex items-center mb-8">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#0A1428] text-white' : 'bg-gray-200'}`}>
                        <FiUserPlus size={20} />
                    </div>
                    <div className={`flex-1 h-1 mx-4 ${currentStep > 1 ? 'bg-[#0A1428]' : 'bg-gray-200'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#0A1428] text-white' : 'bg-gray-200'}`}>
                        <FiHome size={20} />
                    </div>
                    <div className={`flex-1 h-1 mx-4 ${currentStep > 2 ? 'bg-[#0A1428]' : 'bg-gray-200'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#0A1428] text-white' : 'bg-gray-200'}`}>
                        <FiUsers size={20} />
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none" />
                                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none" />
                                <input type="text" placeholder="NIC Number" value={formData.nic} onChange={(e) => setFormData({ ...formData, nic: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none" />
                                <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none" />
                                <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full md:col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none" />
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Address Details</h3>
                            <textarea placeholder="Complete Address" rows="4" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none resize-none" />
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Experience & Specializations</h3>
                            <textarea placeholder="Describe experience, certifications, and specializations..." rows="6" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none resize-none" />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center px-6 py-3 rounded-lg font-medium ${currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <FiChevronLeft className="mr-2" /> Previous
                    </button>
                    <span className="text-gray-500">Step {currentStep} of 3</span>
                    {currentStep < 3 ? (
                        <button onClick={nextStep} className="flex items-center px-6 py-3 bg-[#0A1428] text-white rounded-lg font-medium hover:bg-[#1a2f4a]">
                            Next <FiChevronLeft className="ml-2 rotate-180" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                            Submit Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ViewTherapists Component
const ViewTherapists = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const therapists = [
        { id: 1, name: 'Dr. Amara Silva', email: 'amara@spa.com', phone: '+94 77 123 4567', specialization: 'Swedish Massage', status: 'active', experience: '5 years' },
        { id: 2, name: 'Priya Fernando', email: 'priya@spa.com', phone: '+94 77 987 6543', specialization: 'Deep Tissue', status: 'inactive', experience: '3 years' },
        { id: 3, name: 'Kasun Perera', email: 'kasun@spa.com', phone: '+94 77 555 0123', specialization: 'Thai Massage', status: 'active', experience: '7 years' }
    ];

    const filteredTherapists = therapists.filter(therapist =>
        therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">View Therapists</h2>
                        <p className="text-gray-600 mt-1">Manage your spa therapist team</p>
                    </div>
                    <div className="text-sm text-gray-500">{filteredTherapists.length} therapist(s) found</div>
                </div>

                <div className="flex-1 relative mb-8">
                    <input type="text" placeholder="Search therapists by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] focus:border-transparent outline-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTherapists.map((therapist) => (
                        <div key={therapist.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-[#0A1428] rounded-full flex items-center justify-center text-white font-semibold">
                                    {therapist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${therapist.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {therapist.status}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div><span className="font-medium">Email:</span> {therapist.email}</div>
                                <div><span className="font-medium">Specialty:</span> {therapist.specialization}</div>
                                <div><span className="font-medium">Experience:</span> {therapist.experience}</div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                <button className="text-[#0A1428] hover:text-[#1a2f4a] font-medium">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ResignTerminate Component with NNF Modal System
const ResignTerminate = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        therapistId: '', therapistName: '', type: 'resign', reason: '', notes: ''
    });

    const therapists = [
        { id: 1, name: 'Dr. Amara Silva', email: 'amara@spa.com', specialization: 'Swedish Massage', status: 'active' },
        { id: 2, name: 'Priya Fernando', email: 'priya@spa.com', specialization: 'Deep Tissue', status: 'pending_review' },
        { id: 3, name: 'Kasun Perera', email: 'kasun@spa.com', specialization: 'Thai Massage', status: 'active' }
    ];

    const openModal = (therapist, type) => {
        setFormData({ therapistId: therapist.id, therapistName: therapist.name, type, reason: '', notes: '' });
        setCurrentStep(1);
        setShowModal(true);
    };

    const handleSubmit = () => {
        Swal.fire({
            title: 'Request Sent!',
            text: `${formData.type === 'resign' ? 'Resignation' : 'Termination'} request sent! Admin approval pending.`,
            icon: 'success',
            confirmButtonColor: '#0A1428'
        });
        setShowModal(false);
    };

    const filteredTherapists = therapists.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Staff - Resign/Terminate</h2>

                <input
                    type="text"
                    placeholder="Search therapists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTherapists.map((therapist) => (
                        <div key={therapist.id} className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-[#0A1428] rounded-full flex items-center justify-center text-white font-semibold">
                                    {therapist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${therapist.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {therapist.status === 'pending_review' ? 'Pending Review' : therapist.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                <div>Email: {therapist.email}</div>
                                <div>Specialty: {therapist.specialization}</div>
                            </div>
                            {therapist.status === 'active' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openModal(therapist, 'resign')}
                                        className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600"
                                    >
                                        Resign
                                    </button>
                                    <button
                                        onClick={() => openModal(therapist, 'terminate')}
                                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600"
                                    >
                                        Terminate
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Simple Modal */}
                {showModal && (
                    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                {formData.type === 'resign' ? 'Process Resignation' : 'Process Termination'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <strong>Therapist:</strong> {formData.therapistName}
                                </div>
                                <select
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none"
                                >
                                    <option value="">Select reason</option>
                                    {formData.type === 'resign' ? (
                                        <>
                                            <option value="voluntary">Voluntary Resignation</option>
                                            <option value="relocation">Relocation</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="performance">Performance Issues</option>
                                            <option value="other">Other</option>
                                        </>
                                    )}
                                </select>
                                <textarea
                                    placeholder="Additional notes (optional)"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none resize-none"
                                />
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-700">⚠️ Admin approval needed—irreversible action.</p>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.reason}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
                                >
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminSPA = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Navigation items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
        { id: 'payment-plans', label: 'Payment Plans', icon: <FiCreditCard size={20} /> },
        { id: 'add-therapist', label: 'Add Therapist', icon: <FiUserPlus size={20} /> },
        { id: 'view-therapists', label: 'View Therapists', icon: <FiUsers size={20} /> },
        { id: 'resign-terminate', label: 'Manage Staff', icon: <FiFilter size={20} /> },
        { id: 'spa-settings', label: 'Settings', icon: <FiSettings size={20} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'payment-plans':
                return <PaymentPlans />;
            case 'add-therapist':
                return <AddTherapist />;
            case 'view-therapists':
                return <ViewTherapists />;
            case 'resign-terminate':
                return <ResignTerminate />;
            case 'spa-settings':
                return <SpaSettings />;
            default:
                return <Dashboard />;
        }
    };

    const handleLogout = () => {
        console.log('Logging out...');
        // Implement logout logic
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleNavClick = (item) => {
        setActiveTab(item.id);
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:relative z-50 bg-[#0A1428] text-white transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-full flex flex-col
      `}>
                {/* Logo Section */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <img
                            src={assets.logo_trans}
                            alt="LSA Admin"
                            className={`transition-all duration-300 ${isSidebarOpen ? 'h-14' : 'h-10'}`}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwQTE0MjgiLz48dGV4dCB4PSIxMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0Q0QUYzNyI+TEFOS0EgU1BBIEFTU09DLjwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                    </div>

                    {isSidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/20 text-gold-500 hover:bg-gold-500 hover:text-[#0A1428] transition-all duration-300"
                            title="Collapse sidebar"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Show toggle button when sidebar is minimized */}
                {!isSidebarOpen && (
                    <div className="p-3 border-b border-gray-700 flex justify-center">
                        <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/20 text-gold-500 hover:bg-gold-500 hover:text-[#0A1428] transition-all duration-300"
                            title="Expand sidebar"
                        >
                            <FiChevronLeft size={18} className="transform rotate-180" />
                        </button>
                    </div>
                )}                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavClick(item)}
                                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-300 group
                    ${activeTab === item.id
                                            ? 'bg-gold-500 text-[#0A1428] shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }
                  `}
                                    title={!isSidebarOpen ? item.label : ''}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    <span className={`ml-3 transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip for minimized state */}
                                    {!isSidebarOpen && (
                                        <span className="absolute left-14 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 group"
                        title={!isSidebarOpen ? "Logout" : ""}
                    >
                        <FiLogOut size={20} />
                        <span className={`ml-3 transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
                            Logout
                        </span>

                        {!isSidebarOpen && (
                            <span className="absolute left-14 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                            <button
                                onClick={toggleMobileSidebar}
                                className="lg:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <FiMenu size={24} />
                            </button>
                            <h1 className="ml-4 text-xl font-semibold text-gray-800 capitalize">
                                {activeTab.replace(/-/g, ' ')}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-semibold">
                                    A
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminSPA;

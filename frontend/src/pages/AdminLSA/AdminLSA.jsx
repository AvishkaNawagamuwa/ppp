import React, { useState } from 'react';
import { 
  FiHome, 
  FiPlusSquare, 
  FiClock, 
  FiGrid, 
  FiUserPlus, 
  FiFileText, 
  FiCreditCard, 
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiImage
} from 'react-icons/fi';
import assets from '../../assets/images/images';

// Import components (these would be created separately)
import Dashboard from './Dashboard';
import AddSpa from './Dashboard';
import PendingVerifications from './Dashboard';
import SpaManagement from './Dashboard';
import AddTPLogin from './Dashboard';
import AddBlog from './AddBlog';
import AddGallery from './AddGallery';
import Payments from './Dashboard';

const AdminLSA = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
    { id: 'add-spa', label: 'Add Spa', icon: <FiPlusSquare size={20} /> },
    { id: 'pending-verifications', label: 'Pending Verifications', icon: <FiClock size={20} /> },
    { id: 'spa-management', label: 'Spa Management', icon: <FiGrid size={20} /> },
    { id: 'add-tp-login', label: 'Add TP Login', icon: <FiUserPlus size={20} /> },
    { id: 'add-blog', label: 'Add Blog', icon: <FiFileText size={20} /> },
    { id: 'gallery', label: 'Gallery', icon: <FiImage size={20} /> },
    { id: 'payments', label: 'Payments', icon: <FiCreditCard size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-spa':
        return <AddSpa />;
      case 'pending-verifications':
        return <PendingVerifications />;
      case 'spa-management':
        return <SpaManagement />;
      case 'add-tp-login':
        return <AddTPLogin />;
      case 'add-blog':
        return <AddBlog />;
      case 'gallery':
        return <AddGallery/>;
      case 'payments':
        return <Payments />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Logout logic here
    console.log('Logging out...');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
        {/* Logo Section with Toggle Button */}
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
          
          {/* Toggle Button - Only show when sidebar is open */}
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

        {/* Show toggle button at top when sidebar is minimized */}
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
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
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
            
            {/* Tooltip for minimized state */}
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

export default AdminLSA;
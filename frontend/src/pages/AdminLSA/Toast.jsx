// components/Toast.jsx
import React, { useEffect, useState } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheck className="text-green-500" size={20} />;
      case 'error': return <FiX className="text-red-500" size={20} />;
      case 'warning': return <FiAlertCircle className="text-yellow-500" size={20} />;
      default: return <FiInfo className="text-blue-500" size={20} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      max-w-sm w-full p-4 rounded-lg border shadow-lg ${getBackgroundColor()}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
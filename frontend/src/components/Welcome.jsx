import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import assets from '../assets/images/images';

const Welcome = () => {
  const welcomeRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Create Intersection Observer to detect when section is in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect after first trigger
          observer.disconnect();
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the element is visible
    );

    if (welcomeRef.current) {
      observer.observe(welcomeRef.current);
    }

    return () => {
      if (welcomeRef.current) {
        observer.unobserve(welcomeRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Apply animations when section becomes visible
    if (isVisible) {
      const timer = setTimeout(() => {
        if (logoRef.current) {
          logoRef.current.classList.add('animate-fade-in-up');
        }
      }, 100);

      const textTimer = setTimeout(() => {
        if (textRef.current) {
          textRef.current.classList.add('animate-fade-in-up');
        }
      }, 300);

      const buttonTimer = setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.add('animate-fade-in-up');
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(textTimer);
        clearTimeout(buttonTimer);
      };
    }
  }, [isVisible]);

  return (
    <div ref={welcomeRef} className="w-full bg-white to-gray-50 py-10 px-6 md:px-12 lg:px-24">
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .official-badge {
            position: relative;
            display: inline-block;
          }
          .official-badge::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #0A1428, #D4AF37, #0A1428);
            border-radius: 2px;
          }
          .logo-container {
            transition: all 0.3s ease;
            opacity: 0;
          }
          .logo-container.animate-fade-in-up {
            opacity: 1;
          }
          .logo-container:hover {
            transform: translateY(-5px);
          }
          .welcome-content {
            opacity: 0;
          }
          .welcome-content.animate-fade-in-up {
            opacity: 1;
          }
          .welcome-button {
            opacity: 0;
          }
          .welcome-button.animate-fade-in-up {
            opacity: 1;
          }
        `}
      </style>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Logo Section */}
          <div 
            ref={logoRef}
            className="logo-container mb-0 lg:mb-0 flex-shrink-0 rounded-xl bg-white p-0 flex items-center justify-center"
          >
            <div className="w-50 h-50 md:w-60 md:h-60 rounded-lg bg-white p-4 flex items-center justify-center ">
              <img 
                src={assets.logo_trans} 
                alt="Lanka Spa Association Official Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback logo if image doesn't load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Fallback SVG logo */}
              <div className="hidden w-full h-full items-center justify-center">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
                  <path d="M50 15L65 40H35L50 15Z" fill="#0A1428" />
                  <path d="M35 40L15 60H35V40Z" fill="#0A1428" />
                  <path d="M65 40V60H85L65 40Z" fill="#0A1428" />
                  <path d="M35 60V80H65V60H35Z" fill="#0A1428" />
                  <circle cx="50" cy="50" r="8" fill="#D4AF37" />
                  <circle cx="50" cy="50" r="4" fill="#0A1428" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Content Section - Increased width */}
          <div className="flex-1 text-center lg:text-left lg:w-7/12">
            <div ref={textRef} className="welcome-content">
              <h2 className="text-4xl md:text-6xl lg:text-5xl font-bold text-[#0A1428] mb-8 leading-tight">
                Welcome to the <span className="official-badge">Lanka Spa Association</span>
              </h2>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed max-w-5xl mx-auto lg:mx-0">
                The premier regulatory body for spa and wellness services in Sri Lanka. 
                Established to maintain excellence, ensure compliance with national standards, 
                and promote the growth of the spa industry across the island. The premier regulatory body for spa and wellness services in Sri Lanka. Established to maintain excellence, ensure compliance with national standards, and promote the growth of the spa industry across the island.
              </p>
              
              <div className="mb-6 border-t border-gray-200 pt-8 max-w-6xl mx-auto lg:mx-0">
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold text-[#0A1428]">Registration No:</span> GOV/SPA/2023/0875
                  <span className="mx-4 text-[#D4AF37]">|</span>
                  <span className="font-semibold text-[#0A1428]">Established:</span> 2015
                </p>
              </div>
            </div>
            
            <div ref={buttonRef} className="welcome-button mt-4">
              <Link
                to="/about"
                className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-[#0A1428] font-semibold rounded-lg hover:bg-[#0A1428] hover:text-white transition-all duration-300 border-2 border-[#D4AF37] group"
              >
                About Our Organization
                <FiArrowRight className="ml-3 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
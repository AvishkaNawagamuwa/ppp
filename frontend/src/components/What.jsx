import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiAward } from 'react-icons/fi';
import assets from '../assets/images/images';

const What = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const directorsContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleDirectors, setVisibleDirectors] = useState(3); // Default for large screens

  // Sample data - replace with actual data
  const ceoData = {
    name: "Mr. Prasanna Munasinghe",
    title: "Chief Executive Officer",
    message: "At Lanka Spa Association, we are dedicated to promoting the highest standards of wellness and relaxation across Sri Lanka. Our mission is to elevate the spa industry through education, innovation, and collaboration. With our team of dedicated professionals, we strive to create transformative experiences that honor both traditional Ayurvedic practices and modern wellness techniques.",
    image: assets.ceo_logo,
  };

  const directorsData = [
    {
      id: 1,
      name: "Mr. Rajesh Perera",
      title: "Director of Operations",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 2,
      name: "Dr. Priya Silva",
      title: "Director of Wellness",
      image: "https://images.unsplash.com/photo-1551836026-d5c8c5ab235e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 3,
      name: "Ms. Lakshmi De Silva",
      title: "Director of Training",
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 4,
      name: "Mr. Sameera Bandara",
      title: "Director of Finance",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 5,
      name: "Ms. Nadeesha Jayawardene",
      title: "Director of Marketing",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    }
  ];

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleDirectors(1); // Mobile: show 1 director
      } else if (window.innerWidth < 1024) {
        setVisibleDirectors(2); // Tablet: show 2 directors
      } else {
        setVisibleDirectors(3); // Desktop: show 3 directors
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll the directors
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % directorsData.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPaused, directorsData.length, visibleDirectors]);

  const nextDirector = () => {
    setCurrentIndex((prev) => (prev + 1) % directorsData.length);
  };

  const prevDirector = () => {
    setCurrentIndex((prev) => (prev - 1 + directorsData.length) % directorsData.length);
  };

  // Calculate transform value based on visible directors
  const getTransformValue = () => {
    return `translateX(-${currentIndex * (100 / visibleDirectors)}%)`;
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[#0A1428] text-white overflow-hidden">
      {/* Decorative elements */}
      
      
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 relative z-10">
        {/* CEO Section - Full Width */}
        <div className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-10 lg:gap-12">
            <div className="lg:w-2/5 relative">
              <div className="w-56 h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src={ceoData.image} 
                  alt={ceoData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] via-transparent to-transparent opacity-50"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 lg:-bottom-4 lg:-right-4 bg-[#D4AF37] text-[#0A1428] px-3 py-1 md:px-4 md:py-2 lg:px-5 lg:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base lg:text-lg shadow-lg flex items-center gap-1 md:gap-2">
                <FiAward className="text-sm md:text-base lg:text-xl" />
                <span>CEO</span>
              </div>
              <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 lg:-top-4 lg:-left-4 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0A1428] text-lg md:text-xl lg:text-2xl font-bold shadow-lg">
                LS
              </div>
            </div>
            
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light mb-2 md:mb-3">{ceoData.name}</h2>
                <div className="w-16 md:w-20 lg:w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] mb-3 md:mb-4 mx-auto lg:mx-0"></div>
                <p className="text-[#D4AF37] font-medium text-lg md:text-xl">{ceoData.title}</p>
              </div>
              
              <div className="relative bg-[#152340] p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] rounded-t-xl md:rounded-t-2xl"></div>
                <div className="absolute top-2 md:top-4 -left-2 md:-left-4 text-4xl md:text-5xl lg:text-6xl text-[#D4AF37] opacity-20">"</div>
                <p className="text-gray-200 leading-relaxed text-base md:text-lg font-light">
                  {ceoData.message}
                </p>
                <div className="absolute bottom-2 md:bottom-4 -right-2 md:-right-4 text-4xl md:text-5xl lg:text-6xl text-[#D4AF37] opacity-20">"</div>
                
                {/* Decorative corner elements */}
                <div className="absolute top-1 md:top-2 left-1 md:left-2 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-[#D4AF37]"></div>
                <div className="absolute top-1 md:top-2 right-1 md:right-2 w-3 h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-[#D4AF37]"></div>
                <div className="absolute bottom-1 md:bottom-2 left-1 md:left-2 w-3 h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-[#D4AF37]"></div>
                <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-[#D4AF37]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Directors Section */}
        <div className="text-center mb-10 md:mb-12 lg:mb-16">
          <h3 className="text-2xl md:text-3xl font-serif font-light mb-3 md:mb-4">Board of Directors</h3>
          <div className="w-20 md:w-24 lg:w-32 h-1 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-300 mt-3 md:mt-4 max-w-2xl mx-auto font-light text-sm md:text-base">
            Our esteemed team of visionaries guiding Lanka Spa Association to excellence
          </p>
        </div>

        <div 
          className="relative px-8 md:px-12 lg:px-16"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden py-4 md:py-6">
            <div 
              ref={directorsContainerRef}
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: getTransformValue() }}
            >
              {directorsData.map((director, index) => (
                <div key={director.id} className={`flex-shrink-0 px-3 md:px-4 lg:px-5 ${visibleDirectors === 1 ? 'w-full' : visibleDirectors === 2 ? 'w-1/2' : 'w-1/3'}`}>
                  <div className="flex flex-col items-center group">
                    <div className="relative mb-4 md:mb-5 lg:mb-6">
                      <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-[#1c2c4d] shadow-2xl group-hover:border-[#D4AF37] transition-all duration-500">
                        <img
                          src={director.image}
                          alt={director.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute -inset-2 md:-inset-3 lg:-inset-4 border-2 border-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0A1428] font-bold text-xs md:text-sm lg:text-base shadow-lg">
                        {director.id}
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-lg md:text-xl mb-1 md:mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">{director.name}</h4>
                      <p className="text-[#D4AF37] font-medium text-sm md:text-base border-t border-[#2a3b5f] pt-1 md:pt-2 inline-block">{director.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation arrows - hidden on mobile */}
          <button
            onClick={prevDirector}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#1c2c4d] p-2 md:p-3 lg:p-4 rounded-full hover:bg-[#D4AF37] hover:text-[#0A1428] transition-all duration-300 shadow-xl border border-[#2a3b5f] hidden sm:block"
          >
            <FiChevronLeft className="text-lg md:text-xl lg:text-2xl" />
          </button>
          <button
            onClick={nextDirector}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#1c2c4d] p-2 md:p-3 lg:p-4 rounded-full hover:bg-[#D4AF37] hover:text-[#0A1428] transition-all duration-300 shadow-xl border border-[#2a3b5f] hidden sm:block"
          >
            <FiChevronRight className="text-lg md:text-xl lg:text-2xl" />
          </button>
        </div>

        {/* Mobile navigation buttons */}
        <div className="flex justify-center mt-6 sm:hidden">
          <button
            onClick={prevDirector}
            className="bg-[#1c2c4d] p-3 rounded-full hover:bg-[#D4AF37] hover:text-[#0A1428] transition-all duration-300 shadow-lg border border-[#2a3b5f] mx-2"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <button
            onClick={nextDirector}
            className="bg-[#1c2c4d] p-3 rounded-full hover:bg-[#D4AF37] hover:text-[#0A1428] transition-all duration-300 shadow-lg border border-[#2a3b5f] mx-2"
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center mt-8 md:mt-10 lg:mt-12 space-x-2 md:space-x-3">
          {directorsData.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'bg-[#D4AF37] scale-125' 
                  : 'bg-[#1c2c4d] hover:bg-[#2a3b5f]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default What;
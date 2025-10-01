import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Luxury Spa Experiences",
      description: "Discover premium wellness treatments from Sri Lanka's finest spa professionals, curated for your ultimate relaxation and rejuvenation.",
      buttonText: "Explore Services",
      link: "#services",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      title: "Certified Spa Professionals",
      description: "Connect with highly trained and certified therapists who bring authentic Sri Lankan wellness traditions to modern spa experiences.",
      buttonText: "Meet Our Therapists",
      link: "#therapists",
      image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      title: "Award-Winning Wellness",
      description: "Experience our internationally recognized spa treatments that have earned numerous accolades in the global wellness industry.",
      buttonText: "View Awards",
      link: "#awards",
      image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1468&q=80"
    },
    {
      title: "Exclusive Membership",
      description: "Join our prestigious association to access exclusive benefits, training programs, and networking opportunities in the spa industry.",
      buttonText: "Become a Member",
      link: "#membership",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-screen max-h-[700px] overflow-hidden shadow-2xl">
      {/* Slides container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-full h-full relative"
          >
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A1428]/70 via-[#0A1428]/70 to-[#0A1428]/70 z-10"></div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 z-20 opacity-20">
              <svg width="100" height="100" viewBox="0 0 100 100" className="text-gold-500">
                <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="currentColor" />
              </svg>
            </div>
            
            <div className="absolute bottom-10 left-10 z-20 opacity-20 rotate-180">
              <svg width="80" height="80" viewBox="0 0 100 100" className="text-gold-500">
                <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="currentColor" />
              </svg>
            </div>
            
            {/* Content */}
            <div className="relative z-20 flex flex-col justify-center items-start h-full text-white px-8 md:px-16 lg:px-24 max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="w-20 h-1 bg-gold-500 mb-4"></div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-white">{slide.title.split(' ')[0]}</span>{' '}
                  <span className="text-gold-500">{slide.title.split(' ').slice(1).join(' ')}</span>
                </h2>
              </div>
              <p className="text-lg md:text-xl mb-8 text-gray-100 leading-relaxed">{slide.description}</p>
              <div className="flex space-x-4">
                <a 
                  href={slide.link}
                  className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-[#0A1428] font-semibold rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                >
                  {slide.buttonText}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
                <button className="px-6 py-3 border border-gold-500 text-gold-500 hover:bg-gold-500/10 font-medium rounded-md transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation buttons */}
      <button 
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-[#0A1428]/80 hover:bg-[#0A1428] text-gold-500 p-4 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-[#0A1428]/80 hover:bg-[#0A1428] text-gold-500 p-4 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-gold-500 w-8' : 'bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-30 bg-[#0A1428]/80 text-gold-500 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default Carousel;
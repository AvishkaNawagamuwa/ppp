import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiArrowRight, 
         FiFolder, FiActivity, FiUsers, FiBell, FiAlertCircle } from 'react-icons/fi';
import { Link } from "react-router-dom";

const BlogDisplay = () => {
  const [blogs, setBlogs] = useState([]);
  const [groupedBlogs, setGroupedBlogs] = useState({});
  const [mediaIndices, setMediaIndices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredBlogs, setHoveredBlogs] = useState({});
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const slideShowIntervals = useRef({});

  // Category titles and icons mapping
  const categoryData = {
    'Projects': { title: 'Our Projects', icon: <FiFolder className="text-[#D4AF37] mr-3" /> },
    'Activity': { title: 'Latest Activities', icon: <FiActivity className="text-[#D4AF37] mr-3" /> },
    'Meetings': { title: 'Meeting Updates', icon: <FiUsers className="text-[#D4AF37] mr-3" /> },
    'News': { title: 'News & Announcements', icon: <FiBell className="text-[#D4AF37] mr-3" /> },
    'Important Message': { title: 'Important Messages', icon: <FiAlertCircle className="text-[#D4AF37] mr-3" /> }
  };

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/blog');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
          
          // Group blogs by category
          const grouped = data.reduce((acc, blog) => {
            if (!acc[blog.category]) {
              acc[blog.category] = [];
            }
            acc[blog.category].push(blog);
            return acc;
          }, {});
          
          setGroupedBlogs(grouped);
          
          // Initialize media indices for each blog
          const indices = {};
          data.forEach(blog => {
            if (blog.media_paths && blog.media_paths.length > 0) {
              indices[blog.id] = 0;
            }
          });
          setMediaIndices(indices);
        } else {
          console.error('Failed to fetch blogs');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();

    // Clean up intervals on component unmount
    return () => {
      Object.values(slideShowIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all section elements
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [groupedBlogs]);

  // Function to get full URL for media files
  const getMediaUrl = (path) => {
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  // Navigate media for a specific blog
  const nextMedia = (blogId) => {
    setMediaIndices(prev => {
      const blog = blogs.find(b => b.id === blogId);
      if (!blog || !blog.media_paths) return prev;
      
      return {
        ...prev,
        [blogId]: (prev[blogId] + 1) % blog.media_paths.length
      };
    });
  };

  const prevMedia = (blogId) => {
    setMediaIndices(prev => {
      const blog = blogs.find(b => b.id === blogId);
      if (!blog || !blog.media_paths) return prev;
      
      return {
        ...prev,
        [blogId]: (prev[blogId] - 1 + blog.media_paths.length) % blog.media_paths.length
      };
    });
  };

  // Start slideshow for a blog
  const startSlideshow = (blogId) => {
    // Clear any existing interval for this blog
    if (slideShowIntervals.current[blogId]) {
      clearInterval(slideShowIntervals.current[blogId]);
    }
    
    // Set new interval
    slideShowIntervals.current[blogId] = setInterval(() => {
      nextMedia(blogId);
    }, 4000); // Change image every 4 seconds
  };

  // Stop slideshow for a blog
  const stopSlideshow = (blogId) => {
    if (slideShowIntervals.current[blogId]) {
      clearInterval(slideShowIntervals.current[blogId]);
      delete slideShowIntervals.current[blogId];
    }
  };

  // Handle blog hover
  const handleBlogHover = (blogId, hasMultipleMedia) => {
    setHoveredBlogs(prev => ({ ...prev, [blogId]: true }));
    
    // Start slideshow if blog has multiple media
    if (hasMultipleMedia) {
      startSlideshow(blogId);
    }
  };

  // Handle blog leave
  const handleBlogLeave = (blogId) => {
    setHoveredBlogs(prev => ({ ...prev, [blogId]: false }));
    
    // Stop slideshow
    stopSlideshow(blogId);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Media display component
  const MediaDisplay = ({ blog }) => {
    if (!blog.media_paths || blog.media_paths.length === 0) {
      return null;
    }

    const currentIndex = mediaIndices[blog.id] || 0;
    const currentMedia = blog.media_paths[currentIndex];
    const currentType = blog.media_types[currentIndex];
    const hasMultipleMedia = blog.media_paths.length > 1;
    const isHovered = hoveredBlogs[blog.id];
    const mediaRef = useRef(null);

    // Handle smooth zoom effect on hover
    useEffect(() => {
      if (mediaRef.current) {
        if (isHovered) {
          mediaRef.current.style.transform = 'scale(1.05)';
        } else {
          mediaRef.current.style.transform = 'scale(1)';
        }
      }
    }, [isHovered]);

    return (
      <div 
        className="relative max-w-8xl h-56 md:h-64 lg:h-72 bg-gray-100 overflow-hidden mb-4 group rounded-t-xl"
        onMouseEnter={() => handleBlogHover(blog.id, hasMultipleMedia)}
        onMouseLeave={() => handleBlogLeave(blog.id)}
      > 
        {currentType === 'image' ? (
          <div className="w-full h-full overflow-hidden">
            <img
              ref={mediaRef}
              src={getMediaUrl(currentMedia)}
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
              style={{ transition: 'transform 0.7s ease-out' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : currentType === 'video' ? (
          <div className="w-full h-full overflow-hidden">
            <video
              ref={mediaRef}
              src={getMediaUrl(currentMedia)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
              style={{ transition: 'transform 0.7s ease-out' }}
              controls
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0A1428]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Audio Content</p>
            </div>
          </div>
        )}
        
        {hasMultipleMedia && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevMedia(blog.id);
                stopSlideshow(blog.id);
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-[#0A1428] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-md"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextMedia(blog.id);
                stopSlideshow(blog.id);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-[#0A1428] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-md"
            >
              <FiChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {blog.media_paths.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaIndices({...mediaIndices, [blog.id]: index});
                    stopSlideshow(blog.id);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
            
            {/* Slideshow progress bar */}
            {isHovered && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                <div 
                  className="h-full bg-white/80 transition-all duration-100 linear"
                  style={{ 
                    width: `${(currentIndex / (blog.media_paths.length - 1)) * 100}%`,
                    animation: isHovered ? 'progressBar 4s linear' : 'none'
                  }}
                ></div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-auto bg-white to-blue-50">
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
          @keyframes progressBar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
      </style>
      
      {/* Blog Content */}
      <div className="max-w-8xl mx-auto px-6 sm:px-12 py-10 md:py-16">
        {Object.keys(groupedBlogs).length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No blog posts yet</h3>
            <p className="text-gray-500">Check back later for updates and announcements.</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedBlogs).map(([category, categoryBlogs], index) => (
              <section 
                key={category} 
                id={`section-${category}`}
                ref={el => sectionRefs.current[category] = el}
                className={`mb-16 last:mb-0 ${visibleSections[`section-${category}`] ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0A1428] flex items-center">
                    {categoryData[category]?.icon || <FiFolder className="text-[#D4AF37] mr-3" />}
                    {categoryData[category]?.title || category}
                  </h2>
                  <div className="h-1 w-80 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] mt-3 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryBlogs.map((blog, blogIndex) => (
                    <article 
                      key={blog.id} 
                      className={`bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 animate-fade-in-up ${
                        !blog.media_paths || blog.media_paths.length === 0 ? 'pt-6' : ''
                      }`}
                      style={{ animationDelay: `${0.2 + blogIndex * 0.1}s` }}
                      onMouseEnter={() => handleBlogHover(blog.id, blog.media_paths && blog.media_paths.length > 1)}
                      onMouseLeave={() => handleBlogLeave(blog.id)}
                    >
                      <MediaDisplay blog={blog} />
                      
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <FiCalendar className="mr-1.5" />
                          <span>{formatDate(blog.date)}</span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-[#0A1428] mb-3 line-clamp-2">
                          {blog.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {blog.description}
                        </p>
                        
                        <Link
                          to={`/blogs/${blog.id}`}
                          className="flex items-center text-[#D4AF37] font-medium hover:text-[#BF9B30] transition-colors group"
                        >
                          Read more
                          <FiArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogDisplay;
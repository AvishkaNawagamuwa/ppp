import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiCalendar, FiClock, FiFilter, FiChevronLeft, FiChevronRight, FiSearch, FiArrowUp, FiShare2, FiArrowLeft, FiHome } from 'react-icons/fi';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mediaIndices, setMediaIndices] = useState({});
  const [hoveredBlog, setHoveredBlog] = useState(null);
  const blogRefs = useRef({});
  const carouselIntervals = useRef({});
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch all blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/blog');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
          setFilteredBlogs(data);

          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(data.map(blog => blog.category))];
          setCategories(uniqueCategories);

          // Initialize media indices and start carousels
          const indices = {};
          data.forEach(blog => {
            if (blog.media_paths && blog.media_paths.length > 0) {
              indices[blog.id] = 0;
              // Start carousel automatically for blogs with multiple images
              if (blog.media_paths.length > 1) {
                startCarousel(blog.id, blog.media_paths.length);
              }
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
      Object.values(carouselIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  // Start carousel for a blog
  const startCarousel = (blogId, mediaLength) => {
    // Clear any existing interval for this blog
    if (carouselIntervals.current[blogId]) {
      clearInterval(carouselIntervals.current[blogId]);
    }

    // Set new interval
    carouselIntervals.current[blogId] = setInterval(() => {
      setMediaIndices(prev => ({
        ...prev,
        [blogId]: (prev[blogId] + 1) % mediaLength
      }));
    }, 4000); // Change image every 4 seconds
  };

  // Stop carousel for a blog
  const stopCarousel = (blogId) => {
    if (carouselIntervals.current[blogId]) {
      clearInterval(carouselIntervals.current[blogId]);
      delete carouselIntervals.current[blogId];
    }
  };

  // Scroll to specific blog if ID is in URL params
  useEffect(() => {
    if (id && blogs.length > 0) {
      const timer = setTimeout(() => {
        const element = blogRefs.current[id];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add highlight effect
          element.classList.add('ring-4', 'ring-[#D4AF37]', 'transition-all', 'duration-1000');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-[#D4AF37]');
          }, 3000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [id, blogs]);

  // Filter blogs based on category and search query
  useEffect(() => {
    let result = blogs;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(blog => blog.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        blog.description.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query)
      );
    }

    setFilteredBlogs(result);
  }, [blogs, selectedCategory, searchQuery]);

  // Function to get full URL for media files
  const getMediaUrl = (path) => {
    if (path.startsWith('http')) return path;
    return `http://localhost:3001${path}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate reading time
  const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s/g).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Navigate media for a specific blog
  const nextMedia = (blogId, mediaLength) => {
    setMediaIndices(prev => ({
      ...prev,
      [blogId]: (prev[blogId] + 1) % mediaLength
    }));
    // Restart carousel after manual navigation
    startCarousel(blogId, mediaLength);
  };

  const prevMedia = (blogId, mediaLength) => {
    setMediaIndices(prev => ({
      ...prev,
      [blogId]: (prev[blogId] - 1 + mediaLength) % mediaLength
    }));
    // Restart carousel after manual navigation
    startCarousel(blogId, mediaLength);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Share blog function
  const shareBlog = (blogId) => {
    const blogUrl = `${window.location.origin}/media/${blogId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this blog post',
        url: blogUrl,
      })
        .catch(error => {
          console.log('Error sharing:', error);
          navigator.clipboard.writeText(blogUrl);
          Swal.fire({
            title: 'Copied!',
            text: 'Link copied to clipboard!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        });
    } else {
      navigator.clipboard.writeText(blogUrl);
      Swal.fire({
        title: 'Copied!',
        text: 'Link copied to clipboard!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Media display component
  const MediaDisplay = ({ blog }) => {
    if (!blog.media_paths || blog.media_paths.length === 0) {
      return null;
    }

    const currentIndex = mediaIndices[blog.id] || 0;
    const currentMedia = blog.media_paths[currentIndex];
    const currentType = blog.media_types[currentIndex];
    const mediaLength = blog.media_paths.length;

    return (
      <div
        className="w-full relative mb-6 group"
        onMouseEnter={() => {
          setHoveredBlog(blog.id);
          stopCarousel(blog.id);
        }}
        onMouseLeave={() => {
          setHoveredBlog(null);
          if (mediaLength > 1) {
            startCarousel(blog.id, mediaLength);
          }
        }}
      >
        {currentType === 'image' ? (
          <img
            src={getMediaUrl(currentMedia)}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-auto max-h-screen object-cover mx-auto transition-opacity duration-500"
          />
        ) : currentType === 'video' ? (
          <video
            src={getMediaUrl(currentMedia)}
            className="w-full h-auto max-h-screen object-contain mx-auto"
            controls
            autoPlay
          />
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-lg font-medium">Audio Content</p>
              <p className="text-gray-600 mt-1">Click play to listen</p>
            </div>
          </div>
        )}

        {mediaLength > 1 && (
          <>
            <button
              onClick={() => prevMedia(blog.id, mediaLength)}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 ${hoveredBlog === blog.id ? 'opacity-100' : 'opacity-0'}`}
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={() => nextMedia(blog.id, mediaLength)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 ${hoveredBlog === blog.id ? 'opacity-100' : 'opacity-0'}`}
            >
              <FiChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {blog.media_paths.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMediaIndices({ ...mediaIndices, [blog.id]: index });
                    startCarousel(blog.id, mediaLength);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A1428] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Blog Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blogs</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Stay updated with our latest news, projects, and community activities
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-[#0A1428] hover:text-[#D4AF37] transition-colors mr-6"
              >
                <FiHome className="mr-2" />
                Back to Home
              </button>
              <button
                onClick={() => navigate('/blogs')}
                className="flex items-center text-[#0A1428] hover:text-[#D4AF37] transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Back to All Posts
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0A1428] focus:border-[#0A1428] w-64 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-gray-100 py-4 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            <FiFilter className="text-gray-700" />
            <span className="text-gray-700 whitespace-nowrap">Filter by:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === category ? 'bg-[#0A1428] text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No blog posts found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `No results found for "${searchQuery}". Try a different search term.`
                : `No posts available in ${selectedCategory} category.`
              }
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#0A1428] text-white rounded hover:bg-[#1E3A5F] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                ref={el => blogRefs.current[blog.id] = el}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-[#D4AF37] text-[#0A1428] rounded-full text-sm font-medium mb-4">
                    {blog.category}
                  </span>

                  <h2 className="text-2xl md:text-3xl font-bold text-[#0A1428] mb-4">
                    {blog.title}
                  </h2>

                  <div className="flex items-center text-gray-600 text-sm mb-6">
                    <FiCalendar className="mr-1.5" />
                    <span className="mr-4">{formatDate(blog.date)}</span>
                    <FiClock className="mr-1.5" />
                    <span>{getReadingTime(blog.description)}</span>
                  </div>
                </div>

                <MediaDisplay blog={blog} />

                <div className="p-6">
                  <div className="prose max-w-none text-gray-800 leading-relaxed mb-6">
                    {blog.description.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => shareBlog(blog.id)}
                      className="flex items-center px-4 py-2 bg-[#0A1428] text-white rounded hover:bg-[#1E3A5F] transition-colors"
                    >
                      <FiShare2 className="mr-2" />
                      Share This Post
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 bg-[#0A1428] text-white rounded-full shadow-lg hover:bg-[#1E3A5F] transition-all z-20"
        aria-label="Back to top"
      >
        <FiArrowUp size={20} />
      </button>

      {/* Footer */}
      <footer className="bg-[#0A1428] text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Our Blogs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
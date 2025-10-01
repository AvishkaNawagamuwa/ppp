import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiUpload, FiCalendar, FiX, FiPlus, FiImage, FiVideo, FiMusic, FiType, FiFileText, FiEdit, FiTrash2, FiEye, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AddBlog = () => {
  const [blogData, setBlogData] = useState({
    category: '',
    title: '',
    description: '',
    date: '',
    media: [],
    mediaPreviews: [],
    existingMedia: [] // For storing existing media when editing
  });

  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // For media slider
  const fileInputRef = useRef(null);

  const categories = [
    'Projects',
    'Activity',
    'Meetings',
    'News',
    'Important Message'
  ];

  // Fetch all blogs when component mounts or when tab changes to 'view'
  useEffect(() => {
    if (activeTab === 'view') {
      fetchBlogs();
    }
  }, [activeTab]);

  // Filter blogs when category selection changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter(blog => blog.category === selectedCategory));
    }
  }, [blogs, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blog');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      } else {
        console.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchBlogMedia = async (blogId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/${blogId}`);
      if (response.ok) {
        const blog = await response.json();
        return blog.media || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching blog media:', error);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMediaType = (file) => {
    const fileType = file.type.split('/')[0];
    if (fileType === 'image') return 'image';
    if (fileType === 'video') return 'video';
    if (fileType === 'audio' || file.name.endsWith('.mp3')) return 'audio';
    return null;
  };

  const handleMediaUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const mediaType = getMediaType(file);
      if (!mediaType) {
        Swal.fire({
          title: 'Unsupported File!',
          text: `Unsupported file type: ${file.name}. Please upload image, video, or audio files.`,
          icon: 'warning',
          confirmButtonColor: '#0A1428'
        });
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: getMediaType(file),
      name: file.name,
      file: file
    }));

    setBlogData(prev => ({
      ...prev,
      media: [...prev.media, ...validFiles],
      mediaPreviews: [...prev.mediaPreviews, ...newPreviews]
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleMediaUpload(files);
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleMediaUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeMedia = (index) => {
    const newPreviews = [...blogData.mediaPreviews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);

    const newMedia = [...blogData.media];
    newMedia.splice(index, 1);

    setBlogData(prev => ({
      ...prev,
      media: newMedia,
      mediaPreviews: newPreviews
    }));
  };

  const removeExistingMedia = (index) => {
    const newExistingMedia = [...blogData.existingMedia];
    const removedMedia = newExistingMedia.splice(index, 1)[0];

    setBlogData(prev => ({
      ...prev,
      existingMedia: newExistingMedia
    }));

    // Show confirmation message
    Swal.fire({
      title: 'Media Removed',
      text: `"${removedMedia.file_name}" will be removed when you save changes.`,
      icon: 'info',
      confirmButtonColor: '#0A1428'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('category', blogData.category);
      formData.append('title', blogData.title);
      formData.append('description', blogData.description);
      formData.append('date', blogData.date);

      // Append all media files
      blogData.media.forEach((file, index) => {
        formData.append('media', file);
      });

      // Append existing media IDs to be kept - send as array
      blogData.existingMedia.forEach((media) => {
        formData.append('existingMedia[]', media.id);
      });

      const url = editingBlog
        ? `http://localhost:5000/api/blog/${editingBlog.id}`
        : 'http://localhost:5000/api/blog';

      const method = editingBlog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(editingBlog ? 'Blog post updated successfully:' : 'Blog post created successfully:', result);
        Swal.fire({
          title: 'Success!',
          text: editingBlog ? 'Blog post updated successfully!' : 'Blog post created successfully!',
          icon: 'success',
          confirmButtonColor: '#0A1428'
        });

        // Clean up object URLs
        blogData.mediaPreviews.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });

        // Reset form
        setBlogData({
          category: '',
          title: '',
          description: '',
          date: '',
          media: [],
          mediaPreviews: [],
          existingMedia: []
        });

        setEditingBlog(null);
        fetchBlogs(); // Refresh the blog list
        setActiveTab('view'); // Switch to view tab
      } else {
        const errorText = await response.text();
        console.error('Failed to create/update blog post:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to ' + (editingBlog ? 'update' : 'create') + ' blog post: ' + (errorData.error || 'Unknown error'),
            icon: 'error',
            confirmButtonColor: '#0A1428'
          });
        } catch (e) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to ' + (editingBlog ? 'update' : 'create') + ' blog post: ' + errorText,
            icon: 'error',
            confirmButtonColor: '#0A1428'
          });
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        title: 'Form Error!',
        text: 'Error submitting form: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#0A1428'
      });
    }
  };

  const handleEdit = async (blog) => {
    const existingMedia = await fetchBlogMedia(blog.id);

    setEditingBlog(blog);

    // Format date for input field (YYYY-MM-DD)
    const formattedDate = formatDateForInput(blog.date);

    setBlogData({
      category: blog.category,
      title: blog.title,
      description: blog.description,
      date: formattedDate,
      media: [],
      mediaPreviews: [],
      existingMedia: existingMedia
    });
    setActiveTab('content');
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/blog/${blogId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Blog post deleted successfully!',
            icon: 'success',
            confirmButtonColor: '#0A1428'
          });
          fetchBlogs(); // Refresh the blog list
        } else {
          const error = await response.json();
          Swal.fire({
            title: 'Delete Failed!',
            text: 'Failed to delete blog post: ' + error.error,
            icon: 'error',
            confirmButtonColor: '#0A1428'
          });
        }
      } catch (error) {
        console.error('Error deleting blog post:', error);
        Swal.fire({
          title: 'Delete Error!',
          text: 'Error deleting blog post: ' + error.message,
          icon: 'error',
          confirmButtonColor: '#0A1428'
        });
      }
    }
  };

  const cancelEdit = () => {
    setEditingBlog(null);
    setBlogData({
      category: '',
      title: '',
      description: '',
      date: '',
      media: [],
      mediaPreviews: [],
      existingMedia: []
    });
  };

  const MediaIcon = ({ type }) => {
    switch (type) {
      case 'image': return <FiImage className="text-blue-500" size={20} />;
      case 'video': return <FiVideo className="text-red-500" size={20} />;
      case 'audio': return <FiMusic className="text-purple-500" size={20} />;
      default: return <FiImage size={20} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Function to get full URL for media files
  const getMediaUrl = (path) => {
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  // Media slider navigation
  const nextMedia = () => {
    setCurrentMediaIndex(prev => (prev + 1) % blog.media_paths.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex(prev => (prev - 1 + blog.media_paths.length) % blog.media_paths.length);
  };

  // Media Display Component for View Tab
  const MediaSlider = ({ blog }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!blog.media_paths || blog.media_paths.length === 0) {
      return null;
    }

    const currentMedia = blog.media_paths[currentIndex];
    const currentType = blog.media_types[currentIndex];

    return (
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg overflow-hidden">
        {currentType === 'image' ? (
          <img
            src={getMediaUrl(currentMedia)}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : currentType === 'video' ? (
          <video
            src={getMediaUrl(currentMedia)}
            className="w-full h-full object-contain"
            controls
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <FiMusic size={48} className="text-gray-500" />
            <p className="ml-3 text-gray-700">Audio file</p>
          </div>
        )}

        {blog.media_paths.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((currentIndex - 1 + blog.media_paths.length) % blog.media_paths.length)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((currentIndex + 1) % blog.media_paths.length)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {blog.media_paths.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100">
                  <FiFileText className="text-gray-600 text-xl" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-800">
                  {editingBlog ? 'Edit Blog Post' : 'Create New Post'}
                </h1>
              </div>
              {editingBlog && (
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex px-8">
              <button
                className={`px-5 py-4 font-medium flex items-center text-sm ${activeTab === 'content' ? 'text-[#0A1428] border-b-2 border-[#0A1428]' : 'text-gray-500 hover:text-gray-700'} focus:outline-none focus:ring-0`}
                onClick={() => setActiveTab('content')}
              >
                <FiType className="mr-2" />
                Content
              </button>
              <button
                className={`px-5 py-4 font-medium flex items-center text-sm ${activeTab === 'media' ? 'text-[#0A1428] border-b-2 border-[#0A1428]' : 'text-gray-500 hover:text-gray-700'} focus:outline-none focus:ring-0`}
                onClick={() => setActiveTab('media')}
              >
                <FiImage className="mr-2" />
                Media ({blogData.mediaPreviews.length + blogData.existingMedia.length})
              </button>
              <button
                className={`px-5 py-4 font-medium flex items-center text-sm ${activeTab === 'settings' ? 'text-[#0A1428] border-b-2 border-[#0A1428]' : 'text-gray-500 hover:text-gray-700'} focus:outline-none focus:ring-0`}
                onClick={() => setActiveTab('settings')}
              >
                <FiCalendar className="mr-2" />
                Settings
              </button>
              <button
                className={`px-5 py-4 font-medium flex items-center text-sm ${activeTab === 'view' ? 'text-[#0A1428] border-b-2 border-[#0A1428]' : 'text-gray-500 hover:text-gray-700'} focus:outline-none focus:ring-0`}
                onClick={() => setActiveTab('view')}
              >
                <FiEye className="mr-2" />
                View Blogs ({blogs.length})
              </button>
            </div>
          </div>

          {activeTab !== 'view' ? (
            <form onSubmit={handleSubmit} className="p-8">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={blogData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0A1428] focus:border-[#0A1428] bg-white transition-colors duration-200 outline-none"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={blogData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter a captivating title"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0A1428] focus:border-[#0A1428] bg-white transition-colors duration-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      name="description"
                      value={blogData.description}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Write your content here..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0A1428] focus:border-[#0A1428] bg-white transition-colors duration-200 resize-vertical outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 outline-none ${isDragging
                        ? 'border-[#0A1428] bg-gray-100'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      } focus:ring-2 focus:ring-[#0A1428] focus:ring-opacity-50`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current.click()}
                    tabIndex={0}
                  >
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-base text-gray-700 mb-2 font-medium">
                      Drag and drop files here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse your files
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-[#0A1428] rounded-lg shadow-sm hover:bg-[#BF9B30] transition-colors duration-200 font-medium outline-none focus:ring-1 focus:ring-[#0A1428] focus:ring-opacity-50"
                    >
                      <FiPlus className="mr-2" />
                      Select Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.mp3"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Existing Media (for editing) */}
                  {blogData.existingMedia.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium text-gray-800 mb-3">Existing Media</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Click the X button to remove media. Changes will be saved when you update the post.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {blogData.existingMedia.map((media, index) => (
                          <div key={media.id} className="relative border border-gray-200 rounded-lg overflow-hidden group bg-white">
                            {media.file_type === 'image' && (
                              <img
                                src={getMediaUrl(media.file_path)}
                                alt={media.file_name}
                                className="w-full h-40 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            )}

                            {media.file_type === 'video' && (
                              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                                <FiVideo size={40} className="text-gray-500" />
                              </div>
                            )}

                            {media.file_type === 'audio' && (
                              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                                <FiMusic size={40} className="text-gray-500" />
                              </div>
                            )}

                            {/* Fallback for broken images */}
                            <div className={`w-full h-40 flex items-center justify-center ${media.file_type === 'image' ? 'hidden' : 'flex'}`}>
                              <MediaIcon type={media.file_type} />
                            </div>

                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => removeExistingMedia(index)}
                                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200"
                                title="Remove media"
                              >
                                <FiX size={14} />
                              </button>
                            </div>

                            <div className="p-2.5 bg-white border-t border-gray-100">
                              <div className="flex items-center text-gray-700">
                                <MediaIcon type={media.file_type} />
                                <span className="ml-2 text-xs truncate">{media.file_name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Media Previews */}
                  {blogData.mediaPreviews.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium text-gray-800 mb-3">New Media</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {blogData.mediaPreviews.map((preview, index) => (
                          <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden group bg-white">
                            {preview.type === 'image' && (
                              <img
                                src={preview.url}
                                alt={`Preview ${index}`}
                                className="w-full h-40 object-cover"
                              />
                            )}

                            {preview.type === 'video' && (
                              <video
                                src={preview.url}
                                className="w-full h-40 object-cover"
                              />
                            )}

                            {preview.type === 'audio' && (
                              <div className="w-full h-40 bg-gray-100 flex flex-col items-center justify-center p-4">
                                <FiMusic size={40} className="text-gray-500 mb-3" />
                                <p className="text-gray-700 text-sm text-center truncate w-full">{preview.name}</p>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200"
                              >
                                <FiX size={14} />
                              </button>
                            </div>

                            <div className="p-2.5 bg-white border-t border-gray-100">
                              <div className="flex items-center text-gray-700">
                                <MediaIcon type={preview.type} />
                                <span className="ml-2 text-xs truncate">{preview.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="date"
                        value={blogData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0A1428] focus:border-[#0A1428] bg-white transition-colors duration-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-800 mb-1">Publishing Options</h3>
                    <p className="text-gray-600 text-xs">
                      Your post will be visible to all community members immediately after publishing.
                      {blogData.date && new Date(blogData.date) > new Date() && (
                        <span className="block mt-1 text-blue-600">
                          This post is scheduled for the future.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                <div>
                  {activeTab !== 'content' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'media' ? 'content' : 'media')}
                      className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#0A1428] focus:ring-opacity-50"
                    >
                      {activeTab === 'media' ? 'Back to Content' : 'Back to Media'}
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      blogData.mediaPreviews.forEach(preview => {
                        URL.revokeObjectURL(preview.url);
                      });
                      setBlogData({
                        category: '',
                        title: '',
                        description: '',
                        date: '',
                        media: [],
                        mediaPreviews: [],
                        existingMedia: []
                      });
                      setEditingBlog(null);
                    }}
                    className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0A1428] focus:ring-opacity-50"
                  >
                    Reset
                  </button>

                  {activeTab !== 'settings' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'content' ? 'media' : 'settings')}
                      className="cursor-pointer px-4 py-2 bg-[#D4AF37] text-[#0A1428] rounded-lg shadow-sm hover:bg-[#BF9B30] transition-colors duration-200 font-medium outline-none focus:ring-2 focus:ring-[#0A1428] focus:ring-opacity-50"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="cursor-pointer px-5 py-2 bg-[#D4AF37] text-[#0A1428] rounded-lg shadow-sm hover:bg-[#BF9B30] transition-colors duration-200 font-medium outline-none focus:ring-2 focus:ring-[#0A1428] focus:ring-opacity-50"
                    >
                      {editingBlog ? 'Update Post' : 'Publish Post'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">All Blog Posts</h2>

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0A1428] focus:border-[#0A1428] bg-white outline-none"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredBlogs.length === 0 ? (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">
                    {selectedCategory === 'All'
                      ? 'No blog posts found. Create your first post!'
                      : `No blog posts found in ${selectedCategory} category.`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {filteredBlogs.map((blog) => (
                    <div key={blog.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Media Slider on Left */}
                        {(blog.media_paths && blog.media_paths.length > 0) && (
                          <div className="md:w-1/2">
                            <MediaSlider blog={blog} />
                          </div>
                        )}

                        {/* Content on Right */}
                        <div className={`${blog.media_paths && blog.media_paths.length > 0 ? 'md:w-1/2' : 'w-full'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800">{blog.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">{blog.category} • {formatDate(blog.date)}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(blog)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(blog.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 whitespace-pre-line">{blog.description}</p>

                          <div className="text-sm text-gray-500">
                            Created: {formatDate(blog.created_at)}
                            {new Date(blog.date) > new Date() && (
                              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Scheduled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
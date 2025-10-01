import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddGallery = () => {
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manage'

  // Fetch uploaded images on component mount
  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/gallery');
      setUploadedImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setMessage({ text: 'Error loading gallery images', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/png' || 
      file.type === 'image/webp'
    );
    
    if (validFiles.length !== files.length) {
      setMessage({ text: 'Only JPG, PNG, and WebP files are allowed', type: 'error' });
    }
    
    setImages(validFiles);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      setMessage({ text: 'Please select at least one image', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('galleryImages', image);
      });

      const response = await axios.post('http://localhost:5000/api/backend/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ text: 'Images uploaded successfully!', type: 'success' });
        setImages([]);
        document.getElementById('gallery-upload').value = '';
        
        // Refresh the gallery after upload
        fetchUploadedImages();
        // Switch to manage tab after successful upload
        setActiveTab('manage');
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 5000);
      } else {
        setMessage({ text: response.data.message || 'Upload failed', type: 'error' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ text: 'Error uploading images. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/gallery/${filename}`);
      
      if (response.data.success) {
        setMessage({ text: 'Image deleted successfully!', type: 'success' });
        // Refresh the gallery
        fetchUploadedImages();
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setMessage({ text: response.data.message || 'Delete failed', type: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ text: 'Error deleting image. Please try again.', type: 'error' });
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-[#0A1428] mb-6">Gallery Management</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium ${activeTab === 'upload' ? 'border-b-2 border-[#0A1428] text-[#0A1428]' : 'text-gray-500'}`}
          >
            Upload Images
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-medium ${activeTab === 'manage' ? 'border-b-2 border-[#0A1428] text-[#0A1428]' : 'text-gray-500'}`}
          >
            Manage Gallery ({uploadedImages.length})
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <>
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <input
                type="file"
                id="gallery-upload"
                multiple
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="gallery-upload" className="cursor-pointer">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">Click to upload images or drag and drop</p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, WebP up to 10MB each</p>
              </label>
            </div>

            {/* Selected Images Preview */}
            {images.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#0A1428] mb-4">Selected Images ({images.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-xs text-gray-500 truncate mt-1">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || images.length === 0}
                className={`px-6 py-3 rounded-lg font-medium flex items-center ${uploading || images.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0A1428] hover:bg-opacity-90 text-white'}`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Images
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1428]"></div>
              </div>
            ) : uploadedImages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No images in gallery yet. Upload some images to get started.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-[#0A1428]">Gallery Images</h2>
                  <span className="text-sm text-gray-500">{uploadedImages.length} images</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000/gallery/${image}`}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VFRUVFRSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <button
                        onClick={() => deleteImage(image)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="p-3">
                        <p className="text-xs text-gray-500 truncate">{image}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGallery;
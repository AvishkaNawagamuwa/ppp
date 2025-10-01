import { useState, useEffect } from 'react';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/gallery');
        const data = await response.json();
        
        if (data.success) {
          // Map the filenames to full image URLs
          const items = data.images.map((filename, index) => ({
            id: index + 1,
            title: `Image ${index + 1}`,
            image: `http://localhost:5000/gallery/${filename}`
          }));
          setGalleryItems(items);
        } else {
          setError('Failed to load gallery images');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle image click
  const handleImageClick = (item) => {
    setSelectedImage(item);
  };

  // Handle modal navigation
  const handleNext = () => {
    const currentIndex = galleryItems.findIndex(item => item.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    setSelectedImage(galleryItems[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = galleryItems.findIndex(item => item.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedImage(galleryItems[prevIndex]);
  };

  // Close modal
  const handleClose = () => {
    setSelectedImage(null);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Loading gallery...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Our Gallery</h1>
            <p className="text-xl text-gold-500 font-light">Experience our premium services and spaces</p>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => handleImageClick(item)}
            >
              <div className="h-80 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 bg-gray-100"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                <div className="p-6 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-[#0A1428] rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Want to See More?</h2>
          <p className="text-xl text-gold-500 mb-8 max-w-2xl mx-auto">
            Experience our premium services firsthand. Schedule a visit to our facilities today.
          </p>
          <button className="bg-gold-500 text-[#0A1428] px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
            Schedule a Tour
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-white text-3xl z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75"
              onClick={handleClose}
            >
              &times;
            </button>
            
            {/* Previous Button */}
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75"
              onClick={handlePrev}
            >
              &#8249;
            </button>
            
            {/* Next Button */}
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75"
              onClick={handleNext}
            >
              &#8250;
            </button>
            
            {/* Image */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Image Title */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xl">
              {selectedImage.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure gallery directory exists
const galleryDir = path.join(__dirname, '../gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload route
router.post('/backend/gallery', upload.array('galleryImages', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // You can process the files here if needed (e.g., create thumbnails)
    const fileNames = req.files.map(file => file.filename);
    
    res.json({ 
      success: true, 
      message: `${req.files.length} images uploaded successfully`,
      files: fileNames
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large' });
    }
  }
  res.status(400).json({ success: false, message: error.message });
});

// Add to your upload.js file
router.get('/gallery', (req, res) => {
  try {
    const galleryDir = path.join(__dirname, '../gallery');
    fs.readdir(galleryDir, (err, files) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error reading gallery directory' });
      }
      
      // Filter out non-image files if any
      const imageFiles = files.filter(file => 
        file.endsWith('.jpg') || 
        file.endsWith('.jpeg') || 
        file.endsWith('.png') || 
        file.endsWith('.webp')
      );
      
      res.json({ success: true, images: imageFiles });
    });
  } catch (error) {
    console.error('Error reading gallery:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to your upload.js file
router.delete('/gallery/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../gallery', filename);
    
    // Security check: prevent directory traversal
    if (filename.includes('..') || !filename.startsWith('gallery-')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }
    
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ success: false, message: 'File not found' });
        }
        return res.status(500).json({ success: false, message: 'Error deleting file' });
      }
      
      res.json({ success: true, message: 'File deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
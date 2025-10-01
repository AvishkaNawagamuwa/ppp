const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const blogRoutes = require('./routes/blogRoutes');
const uploadRoutes = require('./routes/upload'); // Add this import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add this line to serve gallery images
app.use('/gallery', express.static(path.join(__dirname, 'gallery')));

// Routes
app.use('/api', blogRoutes);
app.use('/api', uploadRoutes); // Add this line for upload routes

// Error handling middleware
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }
  
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// 404 handler - This should be LAST
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
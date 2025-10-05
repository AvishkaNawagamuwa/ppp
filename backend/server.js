const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const blogRoutes = require('./routes/blogRoutes');
const uploadRoutes = require('./routes/upload');
const spaRoutes = require('./routes/spaRoutes');
const adminLSARoutes = require('./routes/adminLSARoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import enhanced routes
const enhancedRegistrationRoutes = require('./routes/enhancedRegistrationRoutes');
const thirdPartyRoutes = require('./routes/thirdPartyRoutes');
const enhancedAdminSPARoutes = require('./routes/enhancedAdminSPARoutes');
const publicWebsiteRoutes = require('./routes/publicWebsiteRoutes');

// Import database connection
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Database connection failed:', error);
    console.log('Server starting without database connection for testing...');
  });

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend origins
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/gallery', express.static(path.join(__dirname, 'gallery')));

// API Routes
app.use('/api', blogRoutes);
app.use('/api', uploadRoutes);
app.use('/api/spa', spaRoutes);
app.use('/api/lsa', adminLSARoutes);
app.use('/api/lsa', notificationRoutes); // Add notification routes (LSA specific)
app.use('/api/notifications', notificationRoutes); // Add notification routes (general)
app.use('/api/therapists', therapistRoutes);

// Enhanced routes
app.use('/api/enhanced-registration', enhancedRegistrationRoutes);
app.use('/api/third-party', thirdPartyRoutes);
app.use('/api/admin-spa-enhanced', enhancedAdminSPARoutes);
app.use('/api/public', publicWebsiteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);

  // Join rooms based on role
  socket.on('join', ({ spaId, role }) => {
    if (role === 'spa' && spaId) {
      socket.join(`spa_${spaId}`);
      console.log(`👨‍💼 SPA ${spaId} joined room: spa_${spaId}`);
    } else if (role === 'lsa') {
      socket.join('lsa');
      console.log('🏛️ LSA admin joined room: lsa');
    }
  });

  socket.on('disconnect', () => {
    console.log('🔗 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.io enabled`);
});
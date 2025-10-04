// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { upload } = require('../middleware/upload');

// Create a new blog post with file upload
router.post('/blog', upload.array('media', 10), blogController.createBlogPost);

// Get all blog posts
router.get('/blog', blogController.getAllBlogPosts);

// Get a single blog post by ID
router.get('/blog/:id', blogController.getBlogPostById);

// Delete a blog post
router.delete('/blog/:id', blogController.deleteBlogPost);

// Update a blog post
router.put('/blog/:id', upload.array('media', 10), blogController.updateBlogPost);

module.exports = router;
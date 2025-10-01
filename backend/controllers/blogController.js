// controllers/blogController.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const blogController = {
  createBlogPost: async (req, res) => {
    console.log('Request received to create blog post');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? req.files.map(f => f.originalname) : 'No files');
    
    const { category, title, description, date } = req.body;
    const files = req.files;
    
    let connection;
    
    try {
      // Validate required fields
      if (!category || !title || !description || !date) {
        return res.status(400).json({ 
          error: 'Missing required fields: category, title, description, or date' 
        });
      }

      // Get a connection from the pool
      connection = await db.getConnection();
      console.log('Database connection established');
      
      // Start transaction
      await connection.beginTransaction();
      console.log('Transaction started');
      
      // Insert blog post
      const [postResult] = await connection.execute(
        'INSERT INTO blog_posts (category, title, description, date) VALUES (?, ?, ?, ?)',
        [category, title, description, date]
      );
      
      const blogId = postResult.insertId;
      console.log('Blog post inserted with ID:', blogId);
      
      // Insert media files if any
      if (files && files.length > 0) {
        console.log('Processing', files.length, 'media files');
        
        for (const file of files) {
          const fileType = file.mimetype.split('/')[0];
          await connection.execute(
            'INSERT INTO blog_media (blog_id, file_path, file_type, file_name) VALUES (?, ?, ?, ?)',
            [blogId, `/uploads/BlogIMG/${file.filename}`, fileType, file.originalname]
          );
          console.log('Media file inserted:', file.originalname);
        }
      } else {
        console.log('No media files to process');
      }
      
      // Commit transaction
      await connection.commit();
      console.log('Transaction committed');
      
      res.status(201).json({
        message: 'Blog post created successfully',
        blogId: blogId
      });
    } catch (error) {
      // Rollback transaction on error
      if (connection) {
        await connection.rollback();
        console.log('Transaction rolled back due to error');
      }
      
      console.error('Error creating blog post:', error.message);
      console.error('Error stack:', error.stack);
      
      // Clean up uploaded files if transaction failed
      if (files && files.length > 0) {
        console.log('Cleaning up uploaded files due to error');
        files.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/BlogIMG', file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted file:', file.filename);
          }
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to create blog post',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    } finally {
      // Release the connection back to the pool
      if (connection) {
        connection.release();
        console.log('Database connection released');
      }
    }
  },

  updateBlogPost: async (req, res) => {
    console.log('=== BLOG POST UPDATE STARTED ===');
    console.log('Blog ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? req.files.map(f => f.originalname) : 'No files');
    
    const { id } = req.params;
    const { category, title, description, date } = req.body;
    const files = req.files;
    
    // Parse existingMedia from FormData - it might be a string or array
    let existingMediaIds = [];
    if (req.body.existingMedia) {
      try {
        // If it's a string, try to parse it as JSON (might be JSON stringified array)
        if (typeof req.body.existingMedia === 'string') {
          existingMediaIds = JSON.parse(req.body.existingMedia);
        } else if (Array.isArray(req.body.existingMedia)) {
          existingMediaIds = req.body.existingMedia;
        }
        
        // Ensure we have an array of numbers
        existingMediaIds = existingMediaIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        console.log('Keeping media with IDs:', existingMediaIds);
      } catch (error) {
        console.error('Error parsing existingMedia:', error);
        existingMediaIds = [];
      }
    }
    
    let connection;
    
    try {
      // Validate required fields
      if (!category || !title || !description || !date) {
        return res.status(400).json({ 
          error: 'Missing required fields: category, title, description, or date' 
        });
      }

      // Get a connection from the pool
      connection = await db.getConnection();
      console.log('✓ Database connection established');
      
      // Start transaction
      await connection.beginTransaction();
      console.log('✓ Transaction started');
      
      // Update blog post
      console.log('Updating blog post...');
      const [postResult] = await connection.execute(
        'UPDATE blog_posts SET category = ?, title = ?, description = ?, date = ? WHERE id = ?',
        [category, title, description, date, id]
      );
      
      if (postResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Blog post not found' });
      }
      
      console.log('✓ Blog post updated');
      
      // Handle media deletion - remove media not in existingMedia list
      if (existingMediaIds.length > 0) {
        // Delete media that are not in the existingMedia list
        const placeholders = existingMediaIds.map(() => '?').join(',');
        const [deleteResult] = await connection.execute(
          `DELETE FROM blog_media WHERE blog_id = ? AND id NOT IN (${placeholders})`,
          [id, ...existingMediaIds]
        );
        console.log('✓ Removed deleted media, count:', deleteResult.affectedRows);
      } else {
        // If no existing media specified, remove all media
        const [deleteResult] = await connection.execute('DELETE FROM blog_media WHERE blog_id = ?', [id]);
        console.log('✓ Removed all media, count:', deleteResult.affectedRows);
      }
      
      // Insert new media files if any
      if (files && files.length > 0) {
        console.log('Processing', files.length, 'new media files...');
        
        for (const file of files) {
          const fileType = file.mimetype.split('/')[0];
          console.log('Inserting media:', file.originalname, 'Type:', fileType);
          
          await connection.execute(
            'INSERT INTO blog_media (blog_id, file_path, file_type, file_name) VALUES (?, ?, ?, ?)',
            [id, `/uploads/BlogIMG/${file.filename}`, fileType, file.originalname]
          );
          console.log('✓ Media file inserted:', file.originalname);
        }
      } else {
        console.log('No new media files to process');
      }
      
      // Commit transaction
      await connection.commit();
      console.log('✓ Transaction committed');
      console.log('=== BLOG POST UPDATE COMPLETED SUCCESSFULLY ===');
      
      res.json({
        message: 'Blog post updated successfully',
        blogId: id
      });
    } catch (error) {
      // Rollback transaction on error
      if (connection) {
        await connection.rollback();
        console.log('✓ Transaction rolled back');
      }
      
      console.error('!!! ERROR UPDATING BLOG POST !!!');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Clean up uploaded files if transaction failed
      if (files && files.length > 0) {
        console.log('Cleaning up uploaded files...');
        files.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/BlogIMG', file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted file:', file.filename);
          }
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to update blog post',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    } finally {
      // Release the connection back to the pool
      if (connection) {
        connection.release();
        console.log('✓ Database connection released');
      }
    }
  },

  getAllBlogPosts: async (req, res) => {
    try {
      const [posts] = await db.execute(`
        SELECT bp.*, 
               GROUP_CONCAT(bm.file_path) as media_paths,
               GROUP_CONCAT(bm.file_type) as media_types
        FROM blog_posts bp
        LEFT JOIN blog_media bm ON bp.id = bm.blog_id
        GROUP BY bp.id
        ORDER BY bp.created_at DESC
      `);
      
      // Process the results to format media as arrays
      const formattedPosts = posts.map(post => ({
        ...post,
        media_paths: post.media_paths ? post.media_paths.split(',') : [],
        media_types: post.media_types ? post.media_types.split(',') : []
      }));
      
      res.json(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  },

  getBlogPostById: async (req, res) => {
    const { id } = req.params;
    
    try {
      const [posts] = await db.execute(`
        SELECT bp.*, 
               bm.id as media_id, 
               bm.file_path, 
               bm.file_type,
               bm.file_name
        FROM blog_posts bp
        LEFT JOIN blog_media bm ON bp.id = bm.blog_id
        WHERE bp.id = ?
      `, [id]);
      
      if (posts.length === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      
      // Format the response
      const blogPost = {
        id: posts[0].id,
        category: posts[0].category,
        title: posts[0].title,
        description: posts[0].description,
        date: posts[0].date,
        created_at: posts[0].created_at,
        media: posts.filter(p => p.file_path).map(p => ({
          id: p.media_id,
          file_path: p.file_path,
          file_type: p.file_type,
          file_name: p.file_name
        }))
      };
      
      res.json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  },

  deleteBlogPost: async (req, res) => {
    const { id } = req.params;
    
    let connection;
    
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      // First delete associated media
      await connection.execute('DELETE FROM blog_media WHERE blog_id = ?', [id]);
      
      // Then delete the blog post
      const [result] = await connection.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Blog post not found' });
      }
      
      await connection.commit();
      res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    } finally {
      if (connection) connection.release();
    }
  }
};

module.exports = blogController;
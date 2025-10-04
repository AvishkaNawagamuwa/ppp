# SPA Management System - Backend

A comprehensive Node.js/Express backend system for managing Spa (Salon, Parlour & Aesthetics) operations with AdminSPA, AdminLSA, and Therapist management capabilities.

## Features

### 🏢 AdminSPA (Spa Management)
- **Spa Registration & Verification**: Complete registration workflow with document uploads
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Therapist Management**: View and manage spa therapists
- **Profile Management**: Update spa information and settings
- **Payment Plans**: Subscription and payment tracking
- **Activity Logs**: Comprehensive audit trail
- **Notifications**: Real-time alerts and updates

### 👩‍💼 AdminLSA (System Administration)
- **System Dashboard**: Overview of all spas and therapists
- **Spa Verification**: Approve/reject spa registrations
- **Therapist Management**: Process therapist applications
- **Status Management**: Update spa and therapist statuses
- **Reports & Analytics**: Generate system-wide reports
- **Activity Monitoring**: System-wide activity logs
- **Bulk Operations**: Manage multiple entities efficiently

### 💆‍♀️ Therapist Management
- **Application System**: Submit and track applications
- **Profile Management**: Maintain professional profiles
- **Public Directory**: Searchable therapist listings
- **Status Tracking**: Application and employment status
- **Document Management**: Certification and qualification uploads
- **Resignation Process**: Structured exit procedures

### 📊 Core Features
- **File Upload System**: Multi-format document and image handling
- **Database Management**: MySQL with comprehensive schema
- **Activity Logging**: Complete audit trail for all actions
- **Notification System**: Real-time alerts and communications
- **Search & Filtering**: Advanced search capabilities
- **API Documentation**: Comprehensive endpoint documentation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **File Upload**: Multer with organized storage
- **CORS**: Cross-origin resource sharing enabled
- **Environment**: dotenv configuration management

## Quick Start

### Prerequisites
- Node.js 16+ installed
- MySQL 8.0+ running
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spa-project/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE lsa_spa_management;
   
   # Import schema
   mysql -u root -p lsa_spa_management < schema.sql
   ```

4. **Environment Configuration**
   Create `.env` file in backend root:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=12345678
   DB_NAME=lsa_spa_management
   DB_PORT=3306
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   Visit `http://localhost:5000/api/health` - should return system status

## Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection configuration
├── controllers/
│   └── blogController.js    # Blog management logic
├── middleware/
│   └── upload.js           # File upload handling
├── models/
│   ├── SpaModel.js         # Spa database operations
│   └── TherapistModel.js   # Therapist database operations
├── routes/
│   ├── adminLSARoutes.js   # Admin LSA endpoints
│   ├── blogRoutes.js       # Blog management routes
│   ├── spaRoutes.js        # Spa management routes
│   ├── therapistRoutes.js  # Therapist routes
│   └── upload.js           # File upload routes
├── uploads/                # File storage directory
│   ├── spas/
│   │   ├── facility/       # Spa facility photos
│   │   ├── certifications/ # Professional certificates
│   │   └── documents/      # NIC, BR, Tax documents
│   ├── therapists/         # Therapist documents
│   └── BlogIMG/           # Blog media files
├── gallery/                # Gallery images
├── server.js              # Main application entry point
├── schema.sql             # Database schema
├── package.json           # Dependencies and scripts
└── API_DOCUMENTATION.md   # Comprehensive API docs
```

## API Endpoints Overview

### Health Check
- `GET /api/health` - System health status

### AdminSPA Routes (`/api/spa`)
- `POST /register` - Register new spa
- `GET /profile/:spaId` - Get spa profile
- `PUT /profile/:spaId` - Update spa profile
- `GET /dashboard/:spaId` - Dashboard statistics
- `GET /therapists/:spaId` - Get spa therapists
- `GET /notifications/:spaId` - Get notifications

### AdminLSA Routes (`/api/lsa`)
- `GET /dashboard` - Admin dashboard
- `GET /spas` - Get all spas with filters
- `PUT /spas/:spaId/verify` - Verify spa
- `GET /therapists` - Get all therapists
- `PUT /therapists/:therapistId/approve` - Approve therapist
- `GET /reports/spas` - Generate spa reports

### Therapist Routes (`/api/therapists`)
- `POST /apply` - Submit application
- `GET /application/:applicationId` - Check status
- `GET /directory` - Public therapist directory
- `POST /:therapistId/resign` - Submit resignation

### Blog Routes (`/api`)
- `GET /blogs` - Get all blogs
- `POST /blogs` - Create blog
- `PUT /blogs/:id` - Update blog
- `DELETE /blogs/:id` - Delete blog

## Database Schema

### Core Tables

1. **spas** - Spa information and registration data
2. **therapists** - Therapist profiles and applications  
3. **therapist_requests** - Application workflow tracking
4. **activity_logs** - System activity audit trail
5. **system_notifications** - Alerts and communications

### Key Features
- **Referential Integrity**: Foreign key constraints
- **JSON Support**: Complex data structures stored as JSON
- **Indexing**: Optimized queries with strategic indexes
- **Audit Trail**: Complete activity logging
- **Status Management**: Workflow state tracking

## File Upload System

### Supported File Types
- **Images**: JPEG, JPG, PNG (up to 50MB)
- **Documents**: PDF, DOC, DOCX (up to 50MB)
- **Media**: Video and audio files for blogs

### Storage Organization
```
uploads/
├── spas/
│   ├── facility/          # Facility photos (up to 10 files)
│   ├── certifications/    # Professional certificates (up to 5 files)
│   └── documents/         # Legal documents (NIC, BR, Tax)
├── therapists/            # Therapist documents and photos
└── BlogIMG/              # Blog media files
```

### File Handling Features
- **Automatic Directory Creation**: Creates folders as needed
- **Unique Naming**: Timestamp-based file naming
- **Type Validation**: Enforced file type restrictions
- **Size Limits**: Configurable upload limits
- **Error Handling**: Comprehensive error responses

## Development

### Running in Development
```bash
npm run dev
```
Uses nodemon for automatic server restart on file changes.

### Environment Variables
```env
PORT=5000                    # Server port
NODE_ENV=development         # Environment mode
DB_HOST=localhost           # Database host
DB_USER=root                # Database user
DB_PASSWORD=12345678        # Database password
DB_NAME=lsa_spa_management  # Database name
DB_PORT=3306                # Database port
```

### Logging
- Request logging with timestamps
- Error logging with stack traces
- Database connection status
- File upload activity

## Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### API Testing
Use tools like Postman or Thunder Client to test endpoints. Import the API documentation for complete endpoint details.

### Database Testing
```sql
-- Check database connection
SELECT 1;

-- View spa statistics
SELECT 
    verification_status,
    COUNT(*) as count 
FROM spas 
GROUP BY verification_status;

-- View therapist applications
SELECT 
    status,
    COUNT(*) as count 
FROM therapists 
GROUP BY status;
```

## Deployment

### Production Setup
1. **Environment Configuration**
   ```env
   NODE_ENV=production
   PORT=80
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-secure-password
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name spa-backend
   pm2 startup
   pm2 save
   ```

3. **Database Migration**
   ```bash
   # Import schema to production database
   mysql -h your-host -u your-user -p your-database < schema.sql
   ```

### Security Considerations
- Use environment variables for sensitive data
- Implement rate limiting for production
- Set up HTTPS with SSL certificates
- Configure firewall rules
- Regular security updates

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   Error: connect ECONNREFUSED ::1:3306
   ```
   **Solution**: Check MySQL service is running and credentials are correct

2. **File Upload Errors**
   ```bash
   Error: ENOENT: no such file or directory
   ```
   **Solution**: Ensure upload directories exist (auto-created on startup)

3. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE :::5000
   ```
   **Solution**: Kill process or change PORT in .env file

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Database Debugging
```sql
-- Check table structure
DESCRIBE spas;
DESCRIBE therapists;
DESCRIBE activity_logs;

-- Check constraints
SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'therapists';
```

## Contributing

### Code Style
- Use consistent indentation (2 spaces)
- Follow Express.js best practices
- Add comments for complex logic
- Use async/await for promises

### Adding New Features
1. Create database migrations if needed
2. Add model methods in appropriate files
3. Create route handlers
4. Update API documentation
5. Add error handling
6. Test thoroughly

### Commit Guidelines
```bash
git commit -m "feat: add therapist resignation workflow"
git commit -m "fix: resolve file upload mime type validation"
git commit -m "docs: update API documentation"
```

## License

This project is developed for the SPA Management System. All rights reserved.

## Support

For technical support or questions:
1. Check the API documentation
2. Review error logs
3. Test with sample data
4. Verify database connections

---

**Built with ❤️ for efficient spa and therapist management**
# SPA Management System API Documentation

## Overview
This API provides comprehensive endpoints for managing the SPA (Salon, Parlour & Aesthetics) management system with AdminSPA, AdminLSA, and Therapist functionalities.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the system does not implement authentication as per user requirements. All endpoints are accessible without authentication tokens.

---

## 1. SPA MANAGEMENT ENDPOINTS

### AdminSPA Routes (`/api/spa`)

#### 1.1 Spa Registration
```http
POST /api/spa/register
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| spa_name | string | Yes | Name of the spa |
| owner_name | string | Yes | Owner's full name |
| email | string | Yes | Contact email |
| contact_phone | string | Yes | Phone number |
| address | string | Yes | Full address |
| city | string | Yes | City name |
| postal_code | string | No | Postal/ZIP code |
| nic_number | string | Yes | National ID number |
| br_number | string | No | Business registration number |
| tax_reg_number | string | No | Tax registration number |
| spa_type | string | Yes | Type of spa (salon/parlour/medical/luxury) |
| services_offered | JSON | No | Array of services |
| facility_description | text | No | Description of facilities |
| operating_hours | JSON | No | Business hours object |
| payment_methods | JSON | No | Accepted payment methods |
| social_media | JSON | No | Social media links |
| nic_front | file | Yes | NIC front image |
| nic_back | file | Yes | NIC back image |
| br_attachment | file | No | Business registration document |
| tax_registration | file | No | Tax registration document |
| other_doc | file | No | Other supporting documents |
| facility_photos | files | No | Up to 10 facility photos |
| professional_certifications | files | No | Up to 5 certification documents |

**Response:**
```json
{
  "success": true,
  "message": "Spa registration submitted successfully",
  "data": {
    "spa_id": 1,
    "status": "pending_verification"
  }
}
```

#### 1.2 Get Spa Profile
```http
GET /api/spa/profile/:spaId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "spa_id": 1,
    "spa_name": "Luxury Spa & Wellness",
    "owner_name": "John Doe",
    "email": "john@luxuryspa.com",
    "verification_status": "pending",
    "status": "active",
    // ... other spa details
  }
}
```

#### 1.3 Update Spa Profile
```http
PUT /api/spa/profile/:spaId
Content-Type: multipart/form-data
```
Same fields as registration (all optional for updates)

#### 1.4 Get Dashboard Statistics
```http
GET /api/spa/dashboard/:spaId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_therapists": 15,
    "active_therapists": 12,
    "pending_applications": 3,
    "approved_this_month": 5,
    "rejected_this_month": 1,
    "revenue_summary": {...},
    "recent_activities": [...]
  }
}
```

#### 1.5 Get Spa Therapists
```http
GET /api/spa/therapists/:spaId?status=approved&page=1&limit=10
```

#### 1.6 Get Payment History
```http
GET /api/spa/payments/:spaId
```

#### 1.7 Get Activity Logs
```http
GET /api/spa/activity-logs/:spaId?page=1&limit=20
```

#### 1.8 Get Notifications
```http
GET /api/spa/notifications/:spaId?read_status=unread
```

#### 1.9 Mark Notification as Read
```http
PUT /api/spa/notifications/:notificationId/read
```

---

## 2. ADMIN LSA ENDPOINTS

### AdminLSA Routes (`/api/lsa`)

#### 2.1 Admin Dashboard
```http
GET /api/lsa/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "spa_statistics": {
      "total_spas": 150,
      "verified_spas": 120,
      "pending_verification": 25,
      "rejected_spas": 5
    },
    "therapist_statistics": {
      "total_therapists": 500,
      "approved_therapists": 400,
      "pending_applications": 80,
      "rejected_applications": 20
    },
    "recent_activities": [...],
    "system_notifications": [...]
  }
}
```

#### 2.2 Get All Spas
```http
GET /api/lsa/spas?status=active&verification_status=verified&page=1&limit=10&search=luxury
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | active/inactive/suspended |
| verification_status | string | pending/verified/rejected |
| city | string | Filter by city |
| spa_type | string | Filter by spa type |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| search | string | Search in spa name/owner name |

#### 2.3 Get Spa Details
```http
GET /api/lsa/spas/:spaId
```

#### 2.4 Verify Spa
```http
PUT /api/lsa/spas/:spaId/verify
Content-Type: application/json

{
  "action": "approve", // or "reject"
  "admin_comments": "All documents verified successfully"
}
```

#### 2.5 Update Spa Status
```http
PUT /api/lsa/spas/:spaId/status
Content-Type: application/json

{
  "status": "suspended", // active/inactive/suspended
  "reason": "Policy violation reported"
}
```

#### 2.6 Get All Therapists
```http
GET /api/lsa/therapists?status=pending&spa_id=1&page=1&limit=10
```

#### 2.7 Get Therapist Details
```http
GET /api/lsa/therapists/:therapistId
```

#### 2.8 Add New Therapist (by Admin)
```http
POST /api/lsa/therapists
Content-Type: multipart/form-data
```
Same fields as therapist application

#### 2.9 Approve Therapist
```http
PUT /api/lsa/therapists/:therapistId/approve
Content-Type: application/json

{
  "admin_comments": "Excellent qualifications and experience"
}
```

#### 2.10 Reject Therapist
```http
PUT /api/lsa/therapists/:therapistId/reject
Content-Type: application/json

{
  "rejection_reason": "insufficient_experience",
  "admin_comments": "Requires minimum 2 years experience"
}
```

#### 2.11 Update Therapist Status
```http
PUT /api/lsa/therapists/:therapistId/status
Content-Type: application/json

{
  "status": "suspended", // active/inactive/suspended/terminated
  "reason": "Performance issues"
}
```

#### 2.12 Get Reports
```http
GET /api/lsa/reports/spas?period=30&type=overview
GET /api/lsa/reports/therapists?period=30&type=overview
```

#### 2.13 Get System Activity Logs
```http
GET /api/lsa/activity-logs?user_type=spa&action_type=create&page=1&limit=50
```

#### 2.14 Get Admin Notifications
```http
GET /api/lsa/notifications?type=system&priority=high&read_status=unread
```

---

## 3. THERAPIST ENDPOINTS

### Therapist Routes (`/api/therapists`)

#### 3.1 Submit Application
```http
POST /api/therapists/apply
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| spa_id | number | Yes | ID of the spa to apply to |
| first_name | string | Yes | First name |
| last_name | string | Yes | Last name |
| nic_number | string | Yes | National ID number |
| email | string | Yes | Email address |
| phone | string | Yes | Phone number |
| date_of_birth | date | Yes | Date of birth (YYYY-MM-DD) |
| gender | string | Yes | male/female/other |
| address | string | Yes | Full address |
| city | string | Yes | City name |
| postal_code | string | No | Postal code |
| specialization | JSON | Yes | Array of specializations |
| experience_years | number | Yes | Years of experience |
| experience_level | string | Yes | beginner/intermediate/expert |
| languages_spoken | JSON | No | Array of languages |
| certifications | JSON | No | Array of certifications |
| hourly_rate | number | Yes | Hourly rate in currency |
| availability | JSON | No | Weekly availability schedule |
| bio | text | No | Professional bio |
| nic_attachment | file | Yes | NIC copy |
| medical_certificate | file | Yes | Medical fitness certificate |
| spa_certificate | file | Yes | Spa training certificate |
| therapist_image | file | No | Professional photo |

**Response:**
```json
{
  "success": true,
  "message": "Therapist application submitted successfully",
  "data": {
    "application_id": 1,
    "status": "pending",
    "reference_number": "TH000001"
  }
}
```

#### 3.2 Get Application Status
```http
GET /api/therapists/application/:applicationId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application_id": 1,
    "reference_number": "TH000001",
    "status": "pending",
    "submitted_date": "2024-01-15T10:00:00Z",
    "last_updated": "2024-01-15T10:00:00Z",
    "first_name": "Jane",
    "last_name": "Smith",
    "spa_name": "Luxury Spa & Wellness",
    "admin_comments": null,
    "rejection_reason": null
  }
}
```

#### 3.3 Update Application
```http
PUT /api/therapists/application/:applicationId
Content-Type: multipart/form-data
```
(Only allowed for pending applications)

#### 3.4 Get Therapist Profile
```http
GET /api/therapists/profile/:therapistId
```
(Only for approved therapists)

#### 3.5 Update Therapist Profile
```http
PUT /api/therapists/profile/:therapistId
Content-Type: multipart/form-data
```
(Only for approved therapists)

#### 3.6 Submit Resignation
```http
POST /api/therapists/:therapistId/resign
Content-Type: application/json

{
  "resignation_reason": "Personal reasons",
  "last_working_date": "2024-02-15"
}
```

#### 3.7 Public Therapist Directory
```http
GET /api/therapists/directory?spa_id=1&specialization=massage&city=Colombo&page=1&limit=12
```

#### 3.8 Get Public Therapist Profile
```http
GET /api/therapists/directory/:therapistId
```

#### 3.9 Search Therapists
```http
GET /api/therapists/search?query=massage&sort_by=rating&page=1&limit=12
```

#### 3.10 Get Filter Options
```http
GET /api/therapists/filters
```

**Response:**
```json
{
  "success": true,
  "data": {
    "specializations": ["massage", "facial", "body_treatment", "aromatherapy"],
    "experience_levels": ["beginner", "intermediate", "expert"],
    "cities": ["Colombo", "Kandy", "Galle", "Negombo"],
    "languages": ["English", "Sinhala", "Tamil"],
    "spa_types": ["salon", "medical", "luxury", "wellness"]
  }
}
```

---

## 4. BLOG ENDPOINTS (Existing)

### Blog Routes (`/api`)

#### 4.1 Get All Blogs
```http
GET /api/blogs
```

#### 4.2 Get Blog by ID
```http
GET /api/blogs/:id
```

#### 4.3 Create Blog
```http
POST /api/blogs
Content-Type: multipart/form-data
```

#### 4.4 Update Blog
```http
PUT /api/blogs/:id
Content-Type: multipart/form-data
```

#### 4.5 Delete Blog
```http
DELETE /api/blogs/:id
```

---

## 5. GALLERY ENDPOINTS (Existing)

### Gallery Routes (`/api`)

#### 5.1 Upload Gallery Image
```http
POST /api/upload-gallery
Content-Type: multipart/form-data
```

#### 5.2 Get Gallery Images
```http
GET /api/gallery
```

#### 5.3 Delete Gallery Image
```http
DELETE /api/gallery/:filename
```

---

## 6. HEALTH CHECK

### System Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### File Upload Errors
- `LIMIT_FILE_SIZE` - File too large (max 50MB)
- `LIMIT_FILE_COUNT` - Too many files
- File type errors for unsupported formats

---

## Database Schema

### Tables
1. **spas** - Main spa information
2. **therapists** - Therapist profiles and applications
3. **therapist_requests** - Therapist application workflow
4. **activity_logs** - System activity tracking
5. **system_notifications** - Notifications and alerts

### Key Relationships
- Spas have many therapists
- Therapists belong to spas
- All activities are logged
- Notifications are sent for status changes

---

## File Upload Structure

```
uploads/
├── spas/
│   ├── facility/          # Facility photos
│   ├── certifications/    # Professional certificates
│   └── documents/         # NIC, BR, Tax docs
├── therapists/            # Therapist documents and photos
└── BlogIMG/              # Blog media files
```

---

## Usage Examples

### 1. Complete Spa Registration Flow
```javascript
// 1. Register spa
const formData = new FormData();
formData.append('spa_name', 'Luxury Wellness Spa');
formData.append('owner_name', 'John Doe');
formData.append('email', 'john@luxuryspa.com');
// ... add other fields
formData.append('nic_front', nicFrontFile);
formData.append('nic_back', nicBackFile);

const response = await fetch('/api/spa/register', {
  method: 'POST',
  body: formData
});

// 2. Check verification status
const statusResponse = await fetch(`/api/spa/verification-status/${spaId}`);

// 3. Get dashboard data
const dashboardResponse = await fetch(`/api/spa/dashboard/${spaId}`);
```

### 2. AdminLSA Spa Management
```javascript
// 1. Get all pending spas
const pendingSpas = await fetch('/api/lsa/spas?verification_status=pending');

// 2. Verify a spa
await fetch(`/api/lsa/spas/${spaId}/verify`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'approve',
    admin_comments: 'All documents verified'
  })
});

// 3. Get system statistics
const dashboard = await fetch('/api/lsa/dashboard');
```

### 3. Therapist Application Process
```javascript
// 1. Submit application
const therapistData = new FormData();
therapistData.append('spa_id', 1);
therapistData.append('first_name', 'Jane');
therapistData.append('last_name', 'Smith');
// ... add other fields
therapistData.append('nic_attachment', nicFile);
therapistData.append('medical_certificate', medicalFile);

const applicationResponse = await fetch('/api/therapists/apply', {
  method: 'POST',
  body: therapistData
});

// 2. Check application status
const statusResponse = await fetch(`/api/therapists/application/${applicationId}`);

// 3. Admin processes application
await fetch(`/api/lsa/therapists/${therapistId}/approve`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    admin_comments: 'Excellent qualifications'
  })
});
```

This API provides a complete solution for managing spas, therapists, and administrative workflows with comprehensive file upload capabilities and detailed activity tracking.
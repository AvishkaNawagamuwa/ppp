-- LSA Spa Management System Database Schema
-- MySQL Database for AdminSPA and AdminLSA Dashboard Communication
-- No authentication required, fully dynamic without hardcoded data

CREATE DATABASE IF NOT EXISTS lsa_spa_management;
USE lsa_spa_management;

-- Table 1: spas
-- Stores spa registration details, owner information, and verification status
CREATE TABLE spas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Spa Business Information
    name VARCHAR(255) NOT NULL,
    spa_br_number VARCHAR(50) UNIQUE NOT NULL,
    spa_tel VARCHAR(20) NOT NULL,
    
    -- Owner Personal Information
    owner_fname VARCHAR(100) NOT NULL,
    owner_lname VARCHAR(100) NOT NULL,
    owner_email VARCHAR(255) UNIQUE NOT NULL,
    owner_nic VARCHAR(20) UNIQUE NOT NULL,
    owner_tel VARCHAR(20),
    owner_cell VARCHAR(20),
    
    -- Spa Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Document Attachments (File Paths)
    nic_front_path VARCHAR(500),                -- NIC Front Photo
    nic_back_path VARCHAR(500),                 -- NIC Back Photo
    br_attachment_path VARCHAR(500),            -- Business Registration Certificate
    tax_registration_path VARCHAR(500),         -- Tax Registration Documents
    other_doc_path VARCHAR(500),                -- Any Other Document (Optional)
    facility_photos JSON,                       -- Array of facility photo paths (Minimum 5)
    professional_certifications JSON,           -- Array of staff certification paths
    
    -- Verification Status
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,                      -- Reason if rejected by LSA
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(100),                   -- LSA admin who verified
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for Performance
    INDEX idx_spa_name (name),
    INDEX idx_spa_nic (owner_nic),
    INDEX idx_spa_status (status),
    INDEX idx_spa_br (spa_br_number)
);

-- Table 2: therapists
-- Core table for therapist management with status flow
-- Status Flow: pending (SPA adds) -> approved/rejected (LSA decides) -> resigned/terminated (SPA manages)
CREATE TABLE therapists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spa_id INT NOT NULL,
    
    -- Therapist Personal Information
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    birthday DATE,
    nic VARCHAR(20) UNIQUE NOT NULL,            -- Unique across entire system
    telno VARCHAR(20) NOT NULL,
    email VARCHAR(255),                         -- Optional
    specialty VARCHAR(100),                     -- e.g., 'Swedish Massage', 'Aromatherapy'
    
    -- Document Attachments (File Paths)
    nic_attachment_path VARCHAR(500),           -- NIC Attachment
    medical_certificate_path VARCHAR(500),      -- Medical Certificate from recognized spa center
    spa_certificate_path VARCHAR(500),          -- Spa Center Certificate
    therapist_image_path VARCHAR(500),          -- Professional profile image
    
    -- Status Management
    status ENUM('pending', 'approved', 'rejected', 'resigned', 'terminated') DEFAULT 'pending',
    rejection_reason TEXT,                      -- Populated only if status = 'rejected' (from LSA)
    
    -- LSA Review Information
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(100),                   -- LSA admin who reviewed
    
    -- SPA Management Information
    resigned_at TIMESTAMP NULL,
    terminated_at TIMESTAMP NULL,
    termination_reason TEXT,                    -- Reason for termination
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_therapist_name (fname, lname),
    INDEX idx_therapist_nic (nic),
    INDEX idx_therapist_status (status),
    INDEX idx_therapist_spa (spa_id),
    INDEX idx_therapist_specialty (specialty)
);

-- Table 3: therapist_requests
-- Tracks request/response communication between AdminSPA and AdminLSA
CREATE TABLE therapist_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT NOT NULL,
    spa_id INT NOT NULL,
    
    -- Request Details
    request_type ENUM('add', 'update', 'status_change') DEFAULT 'add',
    request_status ENUM('pending', 'reviewed', 'approved', 'rejected') DEFAULT 'pending',
    
    -- LSA Response
    response_message TEXT,                      -- LSA's response/feedback
    response_date TIMESTAMP NULL,
    responded_by VARCHAR(100),                  -- LSA admin who responded
    
    -- Additional Notes
    spa_notes TEXT,                            -- Notes from SPA when submitting
    lsa_notes TEXT,                            -- Internal LSA notes
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_request_status (request_status),
    INDEX idx_request_spa (spa_id),
    INDEX idx_request_therapist (therapist_id)
);

-- Table 4: activity_logs
-- Track all important activities for dashboard recent activity feeds
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Activity Details
    entity_type ENUM('spa', 'therapist', 'request') NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,               -- e.g., 'created', 'approved', 'rejected', 'resigned'
    description TEXT,                           -- Human readable description
    
    -- Actor Information
    actor_type ENUM('spa', 'lsa') NOT NULL,     -- Who performed the action
    actor_id INT,                              -- SPA ID or LSA admin ID
    actor_name VARCHAR(255),                   -- Display name
    
    -- Additional Data
    old_status VARCHAR(50),                    -- Previous status (for status changes)
    new_status VARCHAR(50),                    -- New status (for status changes)
    metadata JSON,                             -- Additional data as needed
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_activity_entity (entity_type, entity_id),
    INDEX idx_activity_actor (actor_type, actor_id),
    INDEX idx_activity_created (created_at)
);

-- Table 5: system_notifications
-- Handle notifications between AdminSPA and AdminLSA
CREATE TABLE system_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Notification Details
    recipient_type ENUM('spa', 'lsa') NOT NULL,
    recipient_id INT,                          -- SPA ID or LSA admin ID
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    
    -- Related Entity (Optional)
    related_entity_type ENUM('spa', 'therapist', 'request'),
    related_entity_id INT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_notification_recipient (recipient_type, recipient_id),
    INDEX idx_notification_unread (is_read, created_at)
);

-- Sample Views for Dashboard Queries
-- View for SPA Dashboard Statistics
CREATE VIEW spa_dashboard_stats AS
SELECT 
    s.id as spa_id,
    s.name as spa_name,
    COUNT(CASE WHEN t.status = 'approved' THEN 1 END) as approved_therapists,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN t.status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN t.status = 'resigned' THEN 1 END) as resigned_therapists,
    COUNT(CASE WHEN t.status = 'terminated' THEN 1 END) as terminated_therapists,
    COUNT(t.id) as total_therapists
FROM spas s
LEFT JOIN therapists t ON s.id = t.spa_id
GROUP BY s.id, s.name;

-- View for LSA Dashboard Statistics
CREATE VIEW lsa_dashboard_stats AS
SELECT 
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_therapists,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN status = 'resigned' THEN 1 END) as resigned_therapists,
    COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_therapists,
    COUNT(id) as total_therapists
FROM therapists;

-- View for Recent Activity
CREATE VIEW recent_activity AS
SELECT 
    al.*,
    CASE 
        WHEN al.entity_type = 'therapist' THEN CONCAT(t.fname, ' ', t.lname)
        WHEN al.entity_type = 'spa' THEN s.name
        ELSE 'System'
    END as entity_name
FROM activity_logs al
LEFT JOIN therapists t ON al.entity_type = 'therapist' AND al.entity_id = t.id
LEFT JOIN spas s ON al.entity_type = 'spa' AND al.entity_id = s.id
ORDER BY al.created_at DESC;
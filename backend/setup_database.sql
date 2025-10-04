-- Create the database
CREATE DATABASE IF NOT EXISTS lsa_spa_management;
USE lsa_spa_management;

-- Create spas table
CREATE TABLE spas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    certificate_path VARCHAR(500),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    reject_reason TEXT,
    approved_by INT DEFAULT NULL,
    approved_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create therapists table
CREATE TABLE therapists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spa_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    certificate_path VARCHAR(500),
    experience_years INT DEFAULT 0,
    specializations JSON,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    reject_reason TEXT,
    approved_by INT DEFAULT NULL,
    approved_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE,
    INDEX idx_spa_id (spa_id)
);

-- Create admin_users table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin_lsa', 'admin_spa', 'government_officer') NOT NULL,
    spa_id INT DEFAULT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE SET NULL,
    INDEX idx_role (role),
    INDEX idx_spa_id (spa_id)
);

-- Create media_gallery table
CREATE TABLE media_gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_type ENUM('photo', 'video', 'news', 'voice') NOT NULL,
    media_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    file_size INT,
    duration INT, -- for videos and voice files (in seconds)
    uploaded_by INT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_media_type (media_type),
    INDEX idx_status (status),
    INDEX idx_uploaded_by (uploaded_by)
);

-- Create notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_id INT NOT NULL,
    recipient_type ENUM('admin_lsa', 'admin_spa', 'government_officer') NOT NULL,
    sender_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('spa_registration', 'therapist_registration', 'approval', 'rejection', 'system') NOT NULL,
    reference_id INT, -- ID of the related spa, therapist, etc.
    reference_type ENUM('spa', 'therapist', 'media', 'system'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_recipient (recipient_id, recipient_type),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type)
);

-- Insert default LSA admin user
INSERT INTO admin_users (username, email, password_hash, role, full_name, phone, department, position) 
VALUES (
    'lsa_admin', 
    'admin@lsa.gov.lk', 
    '$2b$10$rOvRMWkYf.d1V1yJxw9hxOZqN0VHf.9.8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8', -- password: admin123
    'admin_lsa', 
    'LSA Administrator', 
    '+94771234567', 
    'Lanka Spa Association', 
    'System Administrator'
);

-- Insert sample government officer
INSERT INTO admin_users (username, email, password_hash, role, full_name, phone, department, position) 
VALUES (
    'gov_officer', 
    'officer@health.gov.lk', 
    '$2b$10$rOvRMWkYf.d1V1yJxw9hxOZqN0VHf.9.8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8', -- password: officer123
    'government_officer', 
    'Health Department Officer', 
    '+94771234568', 
    'Ministry of Health', 
    'Senior Health Inspector'
);

-- Insert sample spa for testing
INSERT INTO spas (name, email, phone, address, status) 
VALUES (
    'Serenity Spa & Wellness',
    'info@serenityspa.lk',
    '+94771234569',
    '123 Galle Road, Colombo 03, Sri Lanka',
    'approved'
);

-- Insert sample spa admin
INSERT INTO admin_users (username, email, password_hash, role, spa_id, full_name, phone) 
VALUES (
    'spa_admin', 
    'admin@serenityspa.lk', 
    '$2b$10$rOvRMWkYf.d1V1yJxw9hxOZqN0VHf.9.8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8', -- password: spa123
    'admin_spa', 
    1,
    'Spa Manager', 
    '+94771234569'
);

-- Insert sample therapists
INSERT INTO therapists (spa_id, name, email, phone, address, experience_years, specializations, status) 
VALUES 
(1, 'Dr. Ayurveda Silva', 'ayurveda@serenityspa.lk', '+94771234570', 'Colombo 03', 5, '["Ayurveda", "Massage Therapy", "Aromatherapy"]', 'approved'),
(1, 'Ms. Wellness Fernando', 'wellness@serenityspa.lk', '+94771234571', 'Colombo 05', 3, '["Deep Tissue Massage", "Reflexology"]', 'pending'),
(1, 'Mr. Therapy Perera', 'therapy@serenityspa.lk', '+94771234572', 'Mount Lavinia', 7, '["Sports Massage", "Hot Stone Therapy"]', 'rejected');

-- Insert sample media
INSERT INTO media_gallery (title, description, media_type, media_path, uploaded_by, is_featured) 
VALUES 
('Welcome to LSA', 'Official welcome message from Lanka Spa Association', 'news', '/uploads/news/welcome.jpg', 1, TRUE),
('Spa Guidelines 2024', 'Updated guidelines for spa operations', 'news', '/uploads/news/guidelines2024.pdf', 1, FALSE),
('Relaxing Spa Ambiance', 'Peaceful spa environment showcase', 'photo', '/uploads/gallery/spa-ambiance.jpg', 1, TRUE);
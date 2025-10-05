-- LSA System Enhancement - Additional Fields and Tables
-- This extends your existing schema with new requirements

USE lsa_spa_management;

-- 1. Check if columns exist before adding
SET @sql = '';
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'lsa_spa_management' AND table_name = 'spas' AND column_name = 'reference_number';

SET @sql = IF(@col_exists = 0, 'ALTER TABLE spas ADD COLUMN reference_number VARCHAR(20) UNIQUE AFTER id;', '');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add other columns individually
ALTER TABLE spas ADD COLUMN IF NOT EXISTS blacklist_reason TEXT;
ALTER TABLE spas ADD COLUMN IF NOT EXISTS blacklisted_at TIMESTAMP NULL;
ALTER TABLE spas ADD COLUMN IF NOT EXISTS next_payment_date DATE DEFAULT '2025-12-31';
ALTER TABLE spas ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending';
ALTER TABLE spas ADD COLUMN IF NOT EXISTS form1_certificate_path VARCHAR(500);
ALTER TABLE spas ADD COLUMN IF NOT EXISTS spa_photos_banner_path VARCHAR(500);
ALTER TABLE spas ADD COLUMN IF NOT EXISTS annual_fee_paid BOOLEAN DEFAULT FALSE;

-- 2. Create payments table for tracking all payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spa_id INT NOT NULL,
    payment_type ENUM('registration', 'annual', 'monthly') DEFAULT 'registration',
    payment_method ENUM('card', 'bank_transfer') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Bank transfer specific fields
    bank_slip_path VARCHAR(500) NULL,
    bank_transfer_approved BOOLEAN DEFAULT FALSE,
    approval_date TIMESTAMP NULL,
    approved_by VARCHAR(100) NULL,
    rejection_reason TEXT NULL,
    
    -- Card payment specific fields
    payhere_order_id VARCHAR(100) NULL,
    payhere_payment_id VARCHAR(100) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE,
    INDEX idx_payment_spa (spa_id),
    INDEX idx_payment_status (status),
    INDEX idx_payment_reference (reference_number)
);

-- 3. Create admin_users table for AdminLSA, AdminSPA, and Third-party logins
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin_lsa', 'admin_spa', 'government_officer') NOT NULL,
    
    -- SPA specific fields (for admin_spa users)
    spa_id INT NULL,
    
    -- Third-party specific fields (for government_officer users)
    is_temporary BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    created_by INT NULL, -- Admin who created this temp account
    
    -- General fields
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    department VARCHAR(100) NULL, -- For government officers
    
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_admin_role (role),
    INDEX idx_admin_spa (spa_id),
    INDEX idx_admin_active (is_active)
);

-- 4. Enhance therapists table for working history
ALTER TABLE therapists 
ADD COLUMN working_history JSON AFTER termination_reason;

-- 5. Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_id INT NOT NULL,
    featured_image VARCHAR(500) NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    
    FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_blog_status (status),
    INDEX idx_blog_category (category),
    INDEX idx_blog_author (author_id)
);

-- 6. Create blog_media table for blog attachments
CREATE TABLE IF NOT EXISTS blog_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video', 'document') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    INDEX idx_blog_media_blog (blog_id)
);

-- 7. Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image_path VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_gallery_category (category)
);

-- 8. Create financial_summaries table for monthly reports
CREATE TABLE IF NOT EXISTS financial_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    total_registration_fees DECIMAL(12,2) DEFAULT 0,
    total_annual_fees DECIMAL(12,2) DEFAULT 0,
    total_monthly_fees DECIMAL(12,2) DEFAULT 0,
    total_spas_registered INT DEFAULT 0,
    total_payments_processed INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_month_year (month, year)
);

-- 9. Add trigger to auto-generate reference numbers for spas
DELIMITER //
CREATE TRIGGER generate_spa_reference 
BEFORE INSERT ON spas 
FOR EACH ROW 
BEGIN 
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number, 4) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM spas 
    WHERE reference_number REGEXP '^LSA[0-9]+$';
    
    SET NEW.reference_number = CONCAT('LSA', LPAD(next_num, 4, '0'));
END//
DELIMITER ;

-- 10. Add trigger to auto-generate payment reference numbers
DELIMITER //
CREATE TRIGGER generate_payment_reference 
BEFORE INSERT ON payments 
FOR EACH ROW 
BEGIN 
    DECLARE next_num INT;
    DECLARE payment_prefix VARCHAR(10);
    
    CASE NEW.payment_type
        WHEN 'registration' THEN SET payment_prefix = 'REG';
        WHEN 'annual' THEN SET payment_prefix = 'ANN';
        WHEN 'monthly' THEN SET payment_prefix = 'MON';
        ELSE SET payment_prefix = 'PAY';
    END CASE;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number, LENGTH(payment_prefix) + 1) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM payments 
    WHERE reference_number LIKE CONCAT(payment_prefix, '%');
    
    SET NEW.reference_number = CONCAT(payment_prefix, LPAD(next_num, 6, '0'));
END//
DELIMITER ;

-- 11. Insert default admin users
INSERT IGNORE INTO admin_users (username, email, password_hash, role, full_name, phone) VALUES 
('lsa_admin', 'admin@lsa.gov.lk', '$2b$10$K4Jt6P4KgVFxvXs4M1QgFOLtYdMVmO3wXn5K8L9qDwE7Ry4A3B6C2', 'admin_lsa', 'LSA Administrator', '+94771234567'),
('spa_admin', 'spa@test.com', '$2b$10$K4Jt6P4KgVFxvXs4M1QgFOLtYdMVmO3wXn5K8L9qDwE7Ry4A3B6C2', 'admin_spa', 'Spa Administrator', '+94771234568');

-- 12. Sample data for testing
INSERT IGNORE INTO spas (name, spa_br_number, spa_tel, owner_fname, owner_lname, owner_email, owner_nic, address_line1, province, postal_code, status) VALUES 
('Serenity Spa', 'BR001', '+94112345678', 'John', 'Doe', 'john@serenity.lk', '199012345678V', '123 Galle Road', 'Western', '10100', 'pending'),
('Tranquil Waters', 'BR002', '+94112345679', 'Jane', 'Smith', 'jane@tranquil.lk', '199123456789V', '456 Kandy Road', 'Central', '20000', 'approved');

-- 13. Update spa admin user with spa_id
UPDATE admin_users SET spa_id = 1 WHERE username = 'spa_admin';

-- 14. Create views for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM spas WHERE status = 'pending') AS pending_spas,
    (SELECT COUNT(*) FROM spas WHERE status = 'verified') AS verified_spas,
    (SELECT COUNT(*) FROM spas WHERE status = 'rejected') AS rejected_spas,
    (SELECT COUNT(*) FROM spas WHERE status = 'pending' AND blacklist_reason IS NOT NULL) AS blacklisted_spas,
    (SELECT COUNT(*) FROM therapists WHERE status = 'pending') AS pending_therapists,
    (SELECT COUNT(*) FROM therapists WHERE status = 'approved') AS approved_therapists,
    (SELECT COUNT(*) FROM payments WHERE status = 'completed') AS completed_payments,
    (SELECT COUNT(*) FROM payments WHERE payment_method = 'bank_transfer' AND bank_transfer_approved = FALSE) AS pending_bank_transfers,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS monthly_revenue;

-- 15. Indexes for performance
CREATE INDEX idx_spas_reference ON spas(reference_number);
CREATE INDEX idx_spas_payment_status ON spas(payment_status);
CREATE INDEX idx_spas_next_payment ON spas(next_payment_date);
CREATE INDEX idx_payments_created ON payments(created_at);
CREATE INDEX idx_admin_users_role_active ON admin_users(role, is_active);

-- 16. Update existing data with reference numbers if not present
UPDATE spas SET reference_number = CONCAT('LSA', LPAD(id, 4, '0')) WHERE reference_number IS NULL;

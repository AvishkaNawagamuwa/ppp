-- LSA Spa Management System - Database Updates for Dynamic AdminSPA Dashboard
-- Execute these queries in phpMyAdmin or MySQL Workbench BEFORE implementing frontend changes

USE lsa_spa_management;

-- 1. Add missing columns to therapists table
ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS nic_number VARCHAR(20) AFTER email,
ADD COLUMN IF NOT EXISTS nic_attachment VARCHAR(255) AFTER nic_number,
ADD COLUMN IF NOT EXISTS medical_certificate VARCHAR(255) AFTER nic_attachment,
ADD COLUMN IF NOT EXISTS spa_center_certificate VARCHAR(255) AFTER medical_certificate;

-- 2. Update therapist status enum to include resign/terminate
ALTER TABLE therapists 
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'resign', 'terminate') DEFAULT 'pending';

-- 3. Add reason column for resign/terminate actions
ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS reason TEXT AFTER status;

-- 4. Ensure updated_at column exists for activity tracking
ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 5. Create payments table if not exists (for enhanced payment system)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spa_id INT NOT NULL,
    type ENUM('registration_fee', 'annual_fee') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('card', 'bank_transfer') NOT NULL,
    slip_path VARCHAR(255) NULL,
    card_details JSON NULL,
    status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payhere_order_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE
);

-- 6. Add indexes for better performance (MySQL compatible syntax)
-- Note: MySQL doesn't support IF NOT EXISTS for indexes, so we'll skip if they exist
SET @sql = 'CREATE INDEX idx_therapist_spa_status ON therapists(spa_id, status)';
SET @sql = IFNULL(@sql, '');
SET @sql = 'CREATE INDEX idx_therapist_updated_at ON therapists(updated_at)';
SET @sql = IFNULL(@sql, '');
SET @sql = 'CREATE INDEX idx_payments_spa_type ON payments(spa_id, type)';
SET @sql = IFNULL(@sql, '');

-- 7. Sample data for testing (if needed)
-- INSERT INTO therapists (spa_id, fname, lname, nic, telno, status, created_at, updated_at) 
-- VALUES 
-- (1, 'John', 'Doe', '123456789V', '0771234567', 'approved', NOW() - INTERVAL 1 DAY, NOW()),
-- (1, 'Jane', 'Smith', '987654321V', '0779876543', 'pending', NOW(), NOW()),
-- (1, 'Bob', 'Wilson', '456789123V', '0774567891', 'rejected', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY);

-- Verify changes
SELECT 'Tables updated successfully' AS status;
DESCRIBE therapists;
DESCRIBE payments;
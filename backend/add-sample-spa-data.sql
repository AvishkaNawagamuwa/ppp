-- Sample data for testing ManageSpas functionality
USE lsa_spa_management;

-- Clear existing data first (optional)
-- DELETE FROM spas WHERE id > 0;

-- Insert sample spa data with different statuses
INSERT INTO spas (
    name, spa_br_number, spa_tel, 
    owner_fname, owner_lname, owner_email, owner_nic, owner_tel, owner_cell,
    address_line1, address_line2, province, postal_code,
    status, payment_status, blacklist_reason, blacklisted_at,
    created_at
) VALUES 
-- Verified Spas (Approved + Paid)
('Serenity Wellness Spa', 'BR001234567', '0112345678', 
 'Kamal', 'Perera', 'kamal@serenityspa.lk', '871234567V', '0112345678', '0771234567',
 '123 Galle Road', 'Colombo 03', 'Western Province', '00300',
 'verified', 'paid', NULL, NULL, '2024-01-15 10:30:00'),

('Ayurveda Healing Center', 'BR002345678', '0114567890',
 'Saman', 'Silva', 'saman@ayurvedahealing.lk', '801234567V', '0114567890', '0772345678',
 '456 Kandy Road', 'Peradeniya', 'Central Province', '20400',
 'verified', 'paid', NULL, NULL, '2024-01-20 14:15:00'),

-- Unverified Spas (Approved but not paid)
('Lotus Spa & Wellness', 'BR003456789', '0115678901',
 'Nimal', 'Fernando', 'nimal@lotusspa.lk', '751234567V', '0115678901', '0773456789',
 '789 High Level Road', 'Nugegoda', 'Western Province', '10250',
 'verified', 'pending', NULL, NULL, '2024-02-01 09:45:00'),

('Tropical Paradise Spa', 'BR004567890', '0316789012',
 'Priya', 'Jayawardene', 'priya@tropicalparadise.lk', '821234567V', '0316789012', '0774567890',
 '321 Beach Road', 'Mount Lavinia', 'Western Province', '10370',
 'verified', 'overdue', NULL, NULL, '2024-02-05 16:20:00'),

-- Blacklisted Spa
('Zen Garden Spa', 'BR005678901', '0117890123',
 'Ruwan', 'Wickramasinghe', 'ruwan@zengarden.lk', '761234567V', '0117890123', '0775678901',
 '654 Baseline Road', 'Colombo 09', 'Western Province', '00900',
 'verified', 'paid', 'Multiple customer complaints and safety violations reported', '2024-03-01 11:30:00'),

-- Pending Spas
('Harmony Wellness', 'BR006789012', '0118901234',
 'Chaminda', 'Rathnayake', 'chaminda@harmony.lk', '811234567V', '0118901234', '0776789012',
 '987 Malabe Road', 'Malabe', 'Western Province', '10115',
 'pending', 'pending', NULL, NULL, '2024-03-10 13:25:00'),

('Blissful Retreat', 'BR007890123', '0319012345',
 'Anula', 'Gunawardena', 'anula@blissfulretreat.lk', '721234567V', '0319012345', '0777890123',
 '159 Gampaha Road', 'Gampaha', 'Western Province', '11000',
 'pending', 'pending', NULL, NULL, '2024-03-15 08:50:00'),

('Ocean View Spa', 'BR008901234', '0470123456',
 'Mahesh', 'De Silva', 'mahesh@oceanview.lk', '781234567V', '0470123456', '0778901234',
 '753 Marine Drive', 'Negombo', 'Western Province', '11500',
 'pending', 'pending', NULL, NULL, '2024-03-20 12:10:00'),

-- Rejected Spa
('Mystic Spa Center', 'BR009012345', '0911234567',
 'Sunitha', 'Mendis', 'sunitha@mysticspa.lk', '741234567V', '0911234567', '0779012345',
 '852 Main Street', 'Badulla', 'Uva Province', '90000',
 'rejected', 'pending', NULL, NULL, '2024-02-28 15:40:00');

-- Update rejection reason for the rejected spa
UPDATE spas 
SET rejection_reason = 'Incomplete documentation and failure to meet health and safety standards'
WHERE spa_br_number = 'BR009012345';

-- Add some facility photos and documents (sample paths)
UPDATE spas SET 
    nic_front_path = '/uploads/spas/nic_front_sample.jpg',
    nic_back_path = '/uploads/spas/nic_back_sample.jpg',
    br_attachment_path = '/uploads/spas/br_certificate_sample.pdf',
    tax_registration_path = '/uploads/spas/tax_reg_sample.pdf',
    facility_photos = '["\/uploads\/spas\/facility1.jpg","\/uploads\/spas\/facility2.jpg","\/uploads\/spas\/facility3.jpg","\/uploads\/spas\/facility4.jpg","\/uploads\/spas\/facility5.jpg"]'
WHERE id <= 5;

-- Show summary of inserted data
SELECT 
    'Summary of Sample Spa Data' as Info,
    COUNT(*) as Total_Spas,
    SUM(CASE WHEN status = 'verified' AND payment_status = 'paid' AND blacklist_reason IS NULL THEN 1 ELSE 0 END) as Verified,
    SUM(CASE WHEN status = 'verified' AND payment_status != 'paid' AND blacklist_reason IS NULL THEN 1 ELSE 0 END) as Unverified,
    SUM(CASE WHEN blacklist_reason IS NOT NULL THEN 1 ELSE 0 END) as Blacklisted,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as Pending,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as Rejected
FROM spas;
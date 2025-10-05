const db = require('../config/database');
const SpaModel = require('../models/SpaModel');
const TherapistModel = require('../models/TherapistModel');
const NotificationModel = require('../models/NotificationModel');
const ActivityLogModel = require('../models/ActivityLogModel');

class DataSeeder {
    static async seedAll() {
        console.log('🌱 Starting database seeding...');

        try {
            // Clear existing data for fresh start
            await this.clearData();

            // Seed data in order
            const spas = await this.seedSpas();
            const therapists = await this.seedTherapists(spas);
            await this.seedNotifications(spas, therapists);
            await this.seedActivityLogs(spas, therapists);

            console.log('✅ Database seeding completed successfully!');
            return { success: true };
        } catch (error) {
            console.error('❌ Database seeding failed:', error);
            throw error;
        }
    }

    static async clearData() {
        console.log('🧹 Clearing existing data...');

        const tables = [
            'system_notifications',
            'activity_logs',
            'therapist_requests',
            'therapists',
            'spas'
        ];

        for (const table of tables) {
            await db.execute(`DELETE FROM ${table}`);
            await db.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        }

        console.log('✅ Data cleared successfully');
    }

    static async seedSpas() {
        console.log('🏢 Seeding spa data...');

        const spaData = [
            {
                name: 'Serenity Wellness Spa',
                spa_br_number: 'BR001234567',
                spa_tel: '0112345678',
                owner_fname: 'Kamal',
                owner_lname: 'Perera',
                owner_email: 'kamal@serenityspa.lk',
                owner_nic: '199012345678',
                owner_tel: '0112345678',
                owner_cell: '0771234567',
                address_line1: '123 Galle Road',
                address_line2: 'Mount Lavinia',
                province: 'Western',
                postal_code: '10370',
                status: 'verified'
            },
            {
                name: 'Ayurveda Healing Center',
                spa_br_number: 'BR001234568',
                spa_tel: '0114567890',
                owner_fname: 'Saman',
                owner_lname: 'Silva',
                owner_email: 'saman@ayurvedahealing.lk',
                owner_nic: '198534567890',
                owner_tel: '0114567890',
                owner_cell: '0774567890',
                address_line1: '456 Kandy Road',
                address_line2: 'Peradeniya',
                province: 'Central',
                postal_code: '20400',
                status: 'pending'
            },
            {
                name: 'Ocean View Spa Resort',
                spa_br_number: 'BR001234569',
                spa_tel: '0119876543',
                owner_fname: 'Nirmal',
                owner_lname: 'Fernando',
                owner_email: 'nirmal@oceanviewspa.lk',
                owner_nic: '197876543210',
                owner_tel: '0119876543',
                owner_cell: '0779876543',
                address_line1: '789 Beach Road',
                address_line2: 'Bentota',
                province: 'Southern',
                postal_code: '80500',
                status: 'verified'
            },
            {
                name: 'Hill Country Wellness',
                spa_br_number: 'BR001234570',
                spa_tel: '0812345678',
                owner_fname: 'Ruwan',
                owner_lname: 'Jayasinghe',
                owner_email: 'ruwan@hillcountry.lk',
                owner_nic: '199987654321',
                owner_tel: '0812345678',
                owner_cell: '0712345678',
                address_line1: '321 Hill Road',
                address_line2: 'Nuwara Eliya',
                province: 'Central',
                postal_code: '22200',
                status: 'rejected'
            },
            {
                name: 'Urban Spa & Wellness',
                spa_br_number: 'BR001234571',
                spa_tel: '0113456789',
                owner_fname: 'Chamari',
                owner_lname: 'Wickramasinghe',
                owner_email: 'chamari@urbanspa.lk',
                owner_nic: '199256789012',
                owner_tel: '0113456789',
                owner_cell: '0713456789',
                address_line1: '654 Union Place',
                address_line2: 'Colombo 02',
                province: 'Western',
                postal_code: '00200',
                status: 'pending'
            }
        ];

        const spas = [];
        for (const spa of spaData) {
            const query = `
                INSERT INTO spas (
                    name, spa_br_number, spa_tel,
                    owner_fname, owner_lname, owner_email, owner_nic, owner_tel, owner_cell,
                    address_line1, address_line2, province, postal_code, status,
                    facility_photos, professional_certifications
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                spa.name, spa.spa_br_number, spa.spa_tel,
                spa.owner_fname, spa.owner_lname, spa.owner_email, spa.owner_nic,
                spa.owner_tel, spa.owner_cell,
                spa.address_line1, spa.address_line2, spa.province, spa.postal_code, spa.status,
                JSON.stringify(['/uploads/facility1.jpg', '/uploads/facility2.jpg']),
                JSON.stringify(['/uploads/cert1.pdf', '/uploads/cert2.pdf'])
            ]);

            spas.push({ id: result.insertId, ...spa });
        }

        console.log(`✅ Seeded ${spas.length} spas`);
        return spas;
    }

    static async seedTherapists(spas) {
        console.log('👨‍⚕️ Seeding therapist data...');

        const therapistData = [
            // Serenity Wellness Spa (ID: 1) - Verified spa
            {
                spa_id: 1,
                name: 'Priya Rajapaksa',
                email: 'priya@serenityspa.lk',
                phone: '0771111111',
                address: '123 Main Street, Colombo',
                specializations: ['Swedish Massage', 'Aromatherapy'],
                experience_years: 3,
                status: 'approved'
            },
            {
                spa_id: 1,
                name: 'Amal De Silva',
                email: 'amal@serenityspa.lk',
                phone: '0772222222',
                address: '456 Church Street, Mount Lavinia',
                specializations: ['Aromatherapy', 'Reflexology'],
                experience_years: 5,
                status: 'approved'
            },
            {
                spa_id: 1,
                name: 'Sanduni Perera',
                email: 'sanduni@serenityspa.lk',
                phone: '0773333333',
                address: '789 Beach Road, Colombo 3',
                specializations: ['Hot Stone Therapy', 'Deep Tissue'],
                experience_years: 2,
                status: 'pending'
            },
            // Ocean View Spa Resort (ID: 3) - Verified spa
            {
                spa_id: 3,
                name: 'Kasun Mendis',
                email: 'kasun@oceanviewspa.lk',
                phone: '0774444444',
                address: '321 Galle Road, Bentota',
                specializations: ['Deep Tissue Massage', 'Sports Massage'],
                experience_years: 7,
                status: 'approved'
            },
            {
                spa_id: 3,
                name: 'Malini Gunasekara',
                email: 'malini@oceanviewspa.lk',
                phone: '0775555555',
                address: '654 Sea View Lane, Bentota',
                specializations: ['Reflexology', 'Thai Massage'],
                experience_years: 4,
                status: 'rejected'
            },
            // Ayurveda Healing Center (ID: 2) - Pending spa
            {
                spa_id: 2,
                name: 'Tharaka Wijesinghe',
                email: 'tharaka@ayurvedahealing.lk',
                phone: '0776666666',
                address: '987 Kandy Road, Peradeniya',
                specializations: ['Ayurvedic Massage', 'Herbal Therapy'],
                experience_years: 6,
                status: 'pending'
            },
            {
                spa_id: 2,
                name: 'Nimali Rathnayake',
                email: 'nimali@ayurvedahealing.lk',
                phone: '0777777777',
                address: '147 Temple Road, Kandy',
                specializations: ['Herbal Therapy', 'Panchakarma'],
                experience_years: 3,
                status: 'pending'
            },
            // Urban Spa & Wellness (ID: 5) - Pending spa
            {
                spa_id: 5,
                name: 'Dinesh Kumara',
                email: 'dinesh@urbanspa.lk',
                phone: '0778888888',
                address: '258 Union Place, Colombo 2',
                specializations: ['Sports Massage', 'Rehabilitation'],
                experience_years: 8,
                status: 'pending'
            }
        ];

        const therapists = [];
        for (const therapist of therapistData) {
            const query = `
                INSERT INTO therapists (
                    spa_id, name, email, phone, address, specializations, experience_years, status,
                    certificate_path, working_history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const workingHistory = [{
                spa_id: therapist.spa_id,
                start_date: '2023-01-01',
                end_date: null,
                position: 'Senior Therapist',
                experience_gained: therapist.experience_years
            }];

            const [result] = await db.execute(query, [
                therapist.spa_id, therapist.name, therapist.email, therapist.phone, therapist.address,
                JSON.stringify(therapist.specializations), therapist.experience_years, therapist.status,
                '/uploads/certificates/cert.pdf', JSON.stringify(workingHistory)
            ]);

            therapists.push({ id: result.insertId, ...therapist });
        }

        console.log(`✅ Seeded ${therapists.length} therapists`);
        return therapists;
    }

    static async seedNotifications(spas, therapists) {
        console.log('🔔 Seeding notification data...');

        const notifications = [
            // LSA Admin notifications
            {
                recipient_type: 'lsa',
                recipient_id: 1,
                title: 'New Spa Registration Request',
                message: 'Ayurveda Healing Center has submitted registration documents for review',
                type: 'info',
                related_entity_type: 'spa',
                related_entity_id: 2
            },
            {
                recipient_type: 'lsa',
                recipient_id: 1,
                title: 'New Therapist Approval Request',
                message: 'Sanduni Perera from Serenity Wellness Spa requires approval',
                type: 'warning',
                related_entity_type: 'therapist',
                related_entity_id: 3
            },
            {
                recipient_type: 'lsa',
                recipient_id: 1,
                title: 'Multiple Therapist Requests',
                message: 'Urban Spa & Wellness has submitted 1 new therapist for approval',
                type: 'info',
                related_entity_type: 'spa',
                related_entity_id: 5
            },
            // SPA notifications
            {
                recipient_type: 'spa',
                recipient_id: 1,
                title: 'Therapist Approved',
                message: 'Priya Rajapaksa has been approved by LSA administration',
                type: 'success',
                related_entity_type: 'therapist',
                related_entity_id: 1
            },
            {
                recipient_type: 'spa',
                recipient_id: 3,
                title: 'Therapist Rejected',
                message: 'Malini Gunasekara application was rejected. Please review and resubmit.',
                type: 'error',
                related_entity_type: 'therapist',
                related_entity_id: 5
            },
            {
                recipient_type: 'spa',
                recipient_id: 2,
                title: 'Registration Under Review',
                message: 'Your spa registration is currently being reviewed by LSA administration',
                type: 'info',
                related_entity_type: 'spa',
                related_entity_id: 2
            }
        ];

        for (const notification of notifications) {
            await NotificationModel.createNotification(notification);
        }

        console.log(`✅ Seeded ${notifications.length} notifications`);
    }

    static async seedActivityLogs(spas, therapists) {
        console.log('📊 Seeding activity log data...');

        const activities = [
            {
                entity_type: 'spa',
                entity_id: 1,
                action: 'registered',
                description: 'New spa registration submitted',
                actor_type: 'spa',
                actor_id: 1,
                actor_name: 'Kamal Perera',
                new_status: 'pending'
            },
            {
                entity_type: 'spa',
                entity_id: 1,
                action: 'approved',
                description: 'Spa registration approved by LSA',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'pending',
                new_status: 'verified'
            },
            {
                entity_type: 'therapist',
                entity_id: 1,
                action: 'created',
                description: 'New therapist added to spa',
                actor_type: 'spa',
                actor_id: 1,
                actor_name: 'Serenity Wellness Spa',
                new_status: 'pending'
            },
            {
                entity_type: 'therapist',
                entity_id: 1,
                action: 'approved',
                description: 'Therapist approved by LSA administration',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'pending',
                new_status: 'approved'
            },
            {
                entity_type: 'therapist',
                entity_id: 5,
                action: 'rejected',
                description: 'Therapist application rejected due to incomplete documentation',
                actor_type: 'lsa',
                actor_id: 1,
                actor_name: 'LSA Admin',
                old_status: 'pending',
                new_status: 'rejected'
            },
            {
                entity_type: 'spa',
                entity_id: 2,
                action: 'registered',
                description: 'New spa registration submitted',
                actor_type: 'spa',
                actor_id: 2,
                actor_name: 'Saman Silva',
                new_status: 'pending'
            }
        ];

        for (const activity of activities) {
            await ActivityLogModel.logActivity(activity);
        }

        console.log(`✅ Seeded ${activities.length} activity logs`);
    }

    // Quick test method
    static async testConnectivity() {
        try {
            console.log('🧪 Testing database connectivity...');

            // Test spa query
            const [spas] = await db.execute('SELECT COUNT(*) as count FROM spas');
            console.log(`📊 Spas in database: ${spas[0].count}`);

            // Test therapist query
            const [therapists] = await db.execute('SELECT COUNT(*) as count FROM therapists');
            console.log(`👨‍⚕️ Therapists in database: ${therapists[0].count}`);

            // Test notifications query
            const [notifications] = await db.execute('SELECT COUNT(*) as count FROM system_notifications');
            console.log(`🔔 Notifications in database: ${notifications[0].count}`);

            // Test activity logs query
            const [activities] = await db.execute('SELECT COUNT(*) as count FROM activity_logs');
            console.log(`📊 Activity logs in database: ${activities[0].count}`);

            console.log('✅ Database connectivity test passed!');
            return true;
        } catch (error) {
            console.error('❌ Database connectivity test failed:', error);
            return false;
        }
    }
}

module.exports = DataSeeder;

// Run seeder if called directly
if (require.main === module) {
    DataSeeder.seedAll()
        .then(() => {
            console.log('🎉 Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}
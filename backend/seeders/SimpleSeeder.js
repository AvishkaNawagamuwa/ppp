const db = require('../config/database');
const NotificationModel = require('../models/NotificationModel');
const ActivityLogModel = require('../models/ActivityLogModel');

class SimpleSeeder {
    static async seedAll() {
        console.log('🌱 Starting simple database seeding...');

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
                owner_fname: 'Kamal',
                owner_lname: 'Perera',
                email: 'kamal@serenityspa.lk',
                phone: '0112345678',
                address: '123 Galle Road, Mount Lavinia, Western Province',
                status: 'verified',
                verification_status: 'approved',
                reference_number: 'SPA001'
            },
            {
                name: 'Ayurveda Healing Center',
                owner_fname: 'Saman',
                owner_lname: 'Silva',
                email: 'saman@ayurvedahealing.lk',
                phone: '0114567890',
                address: '456 Kandy Road, Peradeniya, Central Province',
                status: 'pending',
                verification_status: 'pending',
                reference_number: 'SPA002'
            },
            {
                name: 'Ocean View Spa Resort',
                owner_fname: 'Nirmal',
                owner_lname: 'Fernando',
                email: 'nirmal@oceanviewspa.lk',
                phone: '0119876543',
                address: '789 Beach Road, Bentota, Southern Province',
                status: 'verified',
                verification_status: 'approved',
                reference_number: 'SPA003'
            },
            {
                name: 'Hill Country Wellness',
                owner_fname: 'Ruwan',
                owner_lname: 'Jayasinghe',
                email: 'ruwan@hillcountry.lk',
                phone: '0812345678',
                address: '321 Hill Road, Nuwara Eliya, Central Province',
                status: 'rejected',
                verification_status: 'rejected',
                reference_number: 'SPA004'
            },
            {
                name: 'Urban Spa & Wellness',
                owner_fname: 'Chamari',
                owner_lname: 'Wickramasinghe',
                email: 'chamari@urbanspa.lk',
                phone: '0113456789',
                address: '654 Union Place, Colombo 02, Western Province',
                status: 'pending',
                verification_status: 'pending',
                reference_number: 'SPA005'
            }
        ];

        const spas = [];
        for (const spa of spaData) {
            const query = `
                INSERT INTO spas (
                    name, owner_fname, owner_lname, email, phone, address, 
                    status, verification_status, reference_number,
                    certificate_path, spa_photos_banner
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                spa.name, spa.owner_fname, spa.owner_lname, spa.email, spa.phone, spa.address,
                spa.status, spa.verification_status, spa.reference_number,
                '/uploads/certificates/spa_cert.pdf',
                JSON.stringify(['/uploads/banner1.jpg', '/uploads/banner2.jpg'])
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
                address: '123 Main Street, Colombo 07',
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
                    spa_id, name, email, phone, address, specializations, 
                    experience_years, status, certificate_path, working_history,
                    current_spa_id, total_experience_years
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const workingHistory = [{
                spa_id: therapist.spa_id,
                spa_name: spas.find(s => s.id === therapist.spa_id)?.name || 'Unknown Spa',
                start_date: '2023-01-01',
                end_date: null,
                position: 'Senior Therapist',
                experience_gained: therapist.experience_years
            }];

            const [result] = await db.execute(query, [
                therapist.spa_id, therapist.name, therapist.email, therapist.phone, therapist.address,
                JSON.stringify(therapist.specializations), therapist.experience_years, therapist.status,
                '/uploads/certificates/therapist_cert.pdf', JSON.stringify(workingHistory),
                therapist.spa_id, therapist.experience_years
            ]);

            therapists.push({ id: result.insertId, ...therapist });
        }

        console.log(`✅ Seeded ${therapists.length} therapists`);
        return therapists;
    }

    static async seedNotifications(spas, therapists) {
        console.log('🔔 Seeding notification data...');

        const notifications = [
            // LSA Admin notifications (recipient_id = 1 for LSA admin)
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
                message: 'Urban Spa & Wellness has submitted new therapists for approval',
                type: 'info',
                related_entity_type: 'spa',
                related_entity_id: 5
            },
            {
                recipient_type: 'lsa',
                recipient_id: 1,
                title: 'Pending Spa Verification',
                message: 'Ayurveda Healing Center requires document verification',
                type: 'warning',
                related_entity_type: 'spa',
                related_entity_id: 2
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
            },
            {
                recipient_type: 'spa',
                recipient_id: 5,
                title: 'Welcome to LSA Network',
                message: 'Your spa registration has been received. Please await verification.',
                type: 'info',
                related_entity_type: 'spa',
                related_entity_id: 5
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
                description: 'New spa registration submitted by Serenity Wellness Spa',
                actor_type: 'spa',
                actor_id: 1,
                actor_name: 'Kamal Perera',
                new_status: 'pending'
            },
            {
                entity_type: 'spa',
                entity_id: 1,
                action: 'approved',
                description: 'Spa registration approved by LSA administration',
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
                description: 'New therapist Priya Rajapaksa added to Serenity Wellness Spa',
                actor_type: 'spa',
                actor_id: 1,
                actor_name: 'Serenity Wellness Spa',
                new_status: 'pending'
            },
            {
                entity_type: 'therapist',
                entity_id: 1,
                action: 'approved',
                description: 'Therapist Priya Rajapaksa approved by LSA administration',
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
                description: 'Therapist Malini Gunasekara application rejected due to incomplete documentation',
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
                description: 'New spa registration submitted by Ayurveda Healing Center',
                actor_type: 'spa',
                actor_id: 2,
                actor_name: 'Saman Silva',
                new_status: 'pending'
            },
            {
                entity_type: 'therapist',
                entity_id: 8,
                action: 'created',
                description: 'New therapist Dinesh Kumara added to Urban Spa & Wellness',
                actor_type: 'spa',
                actor_id: 5,
                actor_name: 'Urban Spa & Wellness',
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
            console.log('🧪 Testing database connectivity and data...');

            // Test spa query with joins
            const [spas] = await db.execute(`
                SELECT s.*, COUNT(t.id) as therapist_count 
                FROM spas s 
                LEFT JOIN therapists t ON s.id = t.spa_id 
                GROUP BY s.id
            `);
            console.log(`📊 Spas with therapist counts:`, spas.length);

            // Test therapist query with spa info
            const [therapists] = await db.execute(`
                SELECT t.*, s.name as spa_name 
                FROM therapists t 
                JOIN spas s ON t.spa_id = s.id
            `);
            console.log(`👨‍⚕️ Therapists with spa info:`, therapists.length);

            // Test notifications query
            const [notifications] = await db.execute(`
                SELECT COUNT(*) as count FROM system_notifications WHERE is_read = FALSE
            `);
            console.log(`🔔 Unread notifications:`, notifications[0].count);

            // Test activity logs query
            const [activities] = await db.execute(`
                SELECT * FROM recent_activity LIMIT 5
            `);
            console.log(`📊 Recent activities:`, activities.length);

            console.log('✅ Database connectivity and data integrity test passed!');
            return true;
        } catch (error) {
            console.error('❌ Database connectivity test failed:', error);
            return false;
        }
    }
}

module.exports = SimpleSeeder;

// Run seeder if called directly
if (require.main === module) {
    SimpleSeeder.seedAll()
        .then(() => SimpleSeeder.testConnectivity())
        .then(() => {
            console.log('🎉 Complete seeding and testing finished successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding/testing failed:', error);
            process.exit(1);
        });
}
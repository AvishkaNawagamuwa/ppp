import React, { useContext } from 'react';
import {
    FiLock,
    FiMapPin,
    FiPhone,
    FiMail,
    FiGlobe,
    FiClock,
    FiSettings,
    FiImage,
    FiUser,
    FiCreditCard,
    FiDroplet,
    FiCheck,
    FiRefreshCw,
    FiShield
} from 'react-icons/fi';

const SpaSettings = () => {
    const settings = {
        spaName: 'Ayura Wellness Spa',
        ownerName: 'Dr. Samantha Perera',
        email: 'info@ayurawellness.lk',
        phone: '+94 11 234 5678',
        address: '123 Galle Road, Colombo 03',
        district: 'Colombo',
        website: 'www.ayurawellness.lk',
        description: 'Premium wellness spa offering authentic Sri Lankan treatments',
        logo: null,
        logoPreview: null,
        primaryColor: '#0A1428',
        secondaryColor: '#D4AF37',
        accentColor: '#FFA500',
        therapistLimit: 10,
        galleryImages: [],
        operatingHours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: true }
        },
        services: ['Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy']
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-8 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spa Profile</h1>
                            <p className="text-gray-600 text-lg">Your complete spa information overview</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <FiRefreshCw size={16} className="text-gray-600" />
                            <span className="text-gray-700 font-medium">Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="space-y-8">
                        {/* Logo and Verification Section */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#0A1428] to-[#1a2f4a] rounded-2xl flex items-center justify-center shadow-lg">
                                    <FiImage size={32} className="text-[#D4AF37]" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                                    <FiShield size={16} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-gray-900">{settings.spaName}</span>
                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                                    <FiCheck size={12} className="mr-1" />
                                    Verified
                                </div>
                            </div>
                        </div>

                        {/* Profile Information Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Basic Information Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                        <FiUser className="text-blue-600" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Business Details</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Spa Name</div>
                                        <div className="text-lg font-bold text-gray-900">{settings.spaName}</div>
                                    </div>

                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Owner</div>
                                        <div className="text-lg text-gray-800">{settings.ownerName}</div>
                                    </div>

                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</div>
                                        <div className="text-lg text-blue-600 font-medium">{settings.email}</div>
                                    </div>

                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                                        <div className="text-lg text-gray-800 font-mono">{settings.phone}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Contact Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                        <FiMapPin className="text-green-600" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Location</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</div>
                                        <div className="text-lg text-gray-800 leading-relaxed">{settings.address}</div>
                                    </div>

                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">District</div>
                                        <div className="text-lg text-gray-800">{settings.district}</div>
                                    </div>

                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Website</div>
                                        <div className="text-lg text-blue-600 font-medium">{settings.website}</div>
                                    </div>

                                    <div className="group">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</div>
                                        <div className="text-lg text-gray-800 leading-relaxed">{settings.description}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operating Hours Section */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                                    <FiClock className="text-amber-600" size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Operating Hours</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {Object.entries(settings.operatingHours).map(([day, hours]) => (
                                    <div key={day} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="font-bold text-gray-900 capitalize mb-2 text-sm">{day.slice(0, 3)}</div>
                                        {hours.closed ? (
                                            <div className="text-red-500 text-xs font-medium">Closed</div>
                                        ) : (
                                            <div className="text-gray-700 text-xs font-mono">
                                                <div>{hours.open}</div>
                                                <div className="text-gray-400">to</div>
                                                <div>{hours.close}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services and Gallery Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mr-4">
                                        <FiSettings className="text-rose-600" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Services</h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {settings.services.map((service, index) => (
                                        <span key={index} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                                            {service}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Therapist Capacity</div>
                                    <div className="text-2xl font-bold text-gray-900">{settings.therapistLimit}</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                        <FiImage className="text-indigo-600" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
                                </div>

                                {settings.galleryImages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <FiImage size={24} className="text-gray-400" />
                                        </div>
                                        <div className="text-gray-500 font-medium">No gallery images uploaded</div>
                                        <div className="text-gray-400 text-sm mt-1">Showcase your spa's ambiance</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            {settings.galleryImages.slice(0, 6).map((img, index) => (
                                                <div key={index} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                                    <img src={img.preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        {settings.galleryImages.length > 6 && (
                                            <div className="text-center text-gray-500 text-sm">
                                                +{settings.galleryImages.length - 6} more images
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaSettings;
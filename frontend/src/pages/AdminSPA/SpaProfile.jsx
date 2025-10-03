import React, { useState } from 'react';
import {
    FiLock,
    FiMapPin,
    FiPhone,
    FiMail,
    FiClock,
    FiImage,
    FiUser,
    FiCheck,
    FiRefreshCw,
    FiShield,
    FiSave,
    FiUpload,
    FiX,
    FiSettings
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const SpaProfile = () => {
    const [operatingHours, setOperatingHours] = useState({
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
    });

    const [selectedServices, setSelectedServices] = useState(['Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy']);
    const [galleryImages, setGalleryImages] = useState([]);

    const availableServices = [
        'Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy',
        'Thai Massage', 'Reflexology', 'Facial Treatment', 'Body Scrub'
    ];

    const spaData = {
        spaName: 'Ayura Wellness Spa',
        ownerName: 'Dr. Samantha Perera',
        email: 'info@ayurawellness.lk',
        phone: '+94 11 234 5678',
        address: '123 Galle Road, Colombo 03',
        district: 'Colombo'
    };

    const handleServiceChange = (service) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleHoursChange = (day, field, value) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleGalleryUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            preview: URL.createObjectURL(file)
        }));
        setGalleryImages([...galleryImages, ...newImages]);
    };

    const removeGalleryImage = (id) => {
        setGalleryImages(galleryImages.filter(img => img.id !== id));
    };

    const handleSave = () => {
        Swal.fire({
            title: 'Profile Updated!',
            text: 'Your spa profile has been updated successfully.',
            icon: 'success',
            confirmButtonColor: '#0A1428'
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spa Profile</h1>
                        <p className="text-gray-600 text-lg">Your complete spa information overview</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <FiRefreshCw size={16} />
                        <span className="font-medium">Refresh</span>
                    </button>
                </div>

                {/* Logo and Verification Section */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#0A1428] to-[#1a2f4a] rounded-2xl flex items-center justify-center shadow-lg">
                            <FiImage size={32} className="text-[#D4AF37]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                            <FiShield size={16} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{spaData.spaName}</span>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                            <FiCheck size={12} className="mr-1" />
                            Verified
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Details (Read-only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FiUser className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Business Details (View Only)</h3>
                    <FiLock className="ml-2 text-gray-400" size={16} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Spa Name</label>
                            <p className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg">{spaData.spaName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Owner</label>
                            <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{spaData.ownerName}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-lg text-blue-600 font-medium bg-gray-50 p-3 rounded-lg">{spaData.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                            <p className="text-lg text-gray-800 font-mono bg-gray-50 p-3 rounded-lg">{spaData.phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location (Read-only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <FiMapPin className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Location (View Only)</h3>
                    <FiLock className="ml-2 text-gray-400" size={16} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                        <p className="text-lg text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg">{spaData.address}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">District</label>
                        <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{spaData.district}</p>
                    </div>
                </div>
            </div>

            {/* Operating Hours (Editable) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                        <FiClock className="text-amber-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Operating Hours</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {Object.entries(operatingHours).map(([day, hours]) => (
                        <div key={day} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="font-bold text-gray-900 capitalize mb-3 text-sm">{day}</div>
                            {!hours.closed ? (
                                <div className="space-y-2">
                                    <input
                                        type="time"
                                        value={hours.open}
                                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                        className="w-full text-xs p-1 border rounded"
                                    />
                                    <div className="text-xs text-gray-400">to</div>
                                    <input
                                        type="time"
                                        value={hours.close}
                                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                        className="w-full text-xs p-1 border rounded"
                                    />
                                </div>
                            ) : (
                                <div className="text-red-500 text-xs font-medium">Closed</div>
                            )}
                            <label className="flex items-center justify-center mt-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={hours.closed}
                                    onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                                    className="mr-1"
                                />
                                Closed
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Services (Editable) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mr-4">
                        <FiSettings className="text-rose-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Services</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableServices.map((service) => (
                        <label key={service} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedServices.includes(service)}
                                onChange={() => handleServiceChange(service)}
                                className="text-[#0A1428] focus:ring-[#0A1428]"
                            />
                            <span className="text-sm">{service}</span>
                        </label>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Selected Services:</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                            <span key={service} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                                {service}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gallery (Editable) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <FiImage className="text-purple-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
                </div>

                <div className="mb-6">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="text-center">
                            <FiUpload className="mx-auto mb-2 text-gray-400" size={24} />
                            <span className="text-sm text-gray-600">Click to upload images</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleGalleryUpload}
                                className="hidden"
                            />
                        </div>
                    </label>
                </div>

                {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((image) => (
                            <div key={image.id} className="relative group">
                                <img
                                    src={image.preview}
                                    alt="Gallery"
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => removeGalleryImage(image.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="text-center">
                <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center mx-auto"
                >
                    <FiSave className="mr-2" />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default SpaProfile;
﻿import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import {
    FiHome,
    FiCreditCard,
    FiUsers,
    FiUserPlus,
    FiFilter,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiChevronLeft,
    FiCamera,
    FiUpload,
    FiX,
    FiBell
} from 'react-icons/fi';
import assets from '../../assets/images/images';

// Import components
import Dashboard from './Dashboard';
import PaymentPlans from './PaymentPlans';
import SpaProfile from './SpaProfile';
import NotificationHistory from './NotificationHistory';

// AddTherapist Component with NNF Flow and Enhanced Validation
const AddTherapist = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', birthday: '', nic: '', phone: ''
    });
    const [attachments, setAttachments] = useState({
        nicFile: null, medicalFile: null, certificateFile: null, imageFile: null
    });
    const [pendingTherapists, setPendingTherapists] = useState([]);
    const [selectedForBulk, setSelectedForBulk] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Camera-specific state for Therapist Image
    const [showCamera, setShowCamera] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraLoading, setCameraLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Validation function
    const validateStep = (step) => {
        let newErrors = {};

        if (step === 1) {
            // Step 1: Personal Information validation
            if (!formData.firstName.trim()) {
                newErrors.firstName = 'First Name is required';
            }
            if (!formData.lastName.trim()) {
                newErrors.lastName = 'Last Name is required';
            }
            if (!formData.birthday) {
                newErrors.birthday = 'Birthday is required (YYYY-MM-DD)';
            } else {
                // Check if birthday is not in future
                const birthDate = new Date(formData.birthday);
                const today = new Date();
                if (birthDate >= today) {
                    newErrors.birthday = 'Birthday cannot be in the future';
                }
                // Check if age is realistic (between 18-65)
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 18) {
                    newErrors.birthday = 'Therapist must be at least 18 years old';
                } else if (age > 65) {
                    newErrors.birthday = 'Please verify the birth year';
                }
            }
            if (!formData.nic.trim()) {
                newErrors.nic = 'NIC Number is required';
            } else if (!/^\d{9}[V|X]$/i.test(formData.nic)) {
                newErrors.nic = 'Invalid NIC format (9 digits + V/X)';
            }
            if (!formData.phone.trim()) {
                newErrors.phone = 'Phone Number is required';
            } else if (!/^\+94\d{9}$/.test(formData.phone)) {
                newErrors.phone = 'Invalid phone format (+94xxxxxxxxx)';
            }
        } else if (step === 2) {
            // Step 2: Document validation
            if (!attachments.nicFile) {
                newErrors.nicFile = 'NIC Attachment is required (PDF/JPG/PNG, max 2MB)';
            }
            if (!attachments.medicalFile) {
                newErrors.medicalFile = 'Medical Certificate is required (PDF/JPG/PNG, max 2MB)';
            }
            if (!attachments.certificateFile) {
                newErrors.certificateFile = 'Spa Center Certificate is required (PDF/JPG/PNG, max 2MB)';
            }
            if (!attachments.imageFile) {
                newErrors.imageFile = 'Profile Image is required (JPG/PNG, max 2MB)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({}); // Clear errors when going back
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // File size validation (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
                title: 'File Too Large',
                text: 'Please select a file under 2MB',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        // File type validation
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                title: 'Invalid File Type',
                text: 'Please select a valid file (PDF, PNG, JPG)',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        // Clear any existing error for this field
        setErrors(prev => ({ ...prev, [type]: null }));

        if (type === 'imageFile') {
            // Special handling for image file with preview
            setAttachments({ ...attachments, [type]: file });
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setAttachments({ ...attachments, [type]: file });
        }
    };

    // WhatsApp-like instant camera connection
    const startCamera = async () => {
        setCameraLoading(true);
        try {
            // Minimal constraints for maximum speed
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            setShowCamera(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Use oncanplay for immediate rendering - faster than onloadedmetadata
                videoRef.current.oncanplay = () => {
                    requestAnimationFrame(() => {
                        videoRef.current.play().catch(err => console.warn('Autoplay prevented:', err));
                        setCameraLoading(false);
                    });
                };

                // Timeout fallback for slow connections
                setTimeout(() => {
                    if (cameraLoading) {
                        setCameraLoading(false);
                        Swal.fire({
                            title: 'Camera Starting Slowly',
                            text: 'Camera is taking longer than expected. Check permissions or use upload instead.',
                            icon: 'info',
                            confirmButtonColor: '#0A1428'
                        });
                    }
                }, 2000);
            }
        } catch (err) {
            console.error('Camera init failed:', err);
            setCameraLoading(false);
            setShowCamera(false);
            Swal.fire({
                title: 'Camera Access Denied',
                text: 'Ensure HTTPS and camera permissions, or use upload from gallery.',
                icon: 'warning',
                confirmButtonColor: '#0A1428'
            });
        }
    };

    // Direct capture & auto-upload like WhatsApp
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState === 4) {
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');

            // Simple center crop for speed
            ctx.drawImage(video, 0, 0, 400, 400);

            const imageData = canvas.toDataURL('image/jpeg', 0.9); // Higher quality for professional photos
            const blob = dataURLToBlob(imageData);

            // Direct "upload" to state - WhatsApp style
            setAttachments({ ...attachments, imageFile: blob });
            setImagePreview(imageData);

            // Clean stop and success feedback
            video.srcObject.getTracks().forEach(track => track.stop());
            setShowCamera(false);
            setCameraLoading(false);

            Swal.fire({
                title: 'Photo Captured!',
                text: 'Image ready for upload',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Camera Not Ready',
                text: 'Please wait a moment and try again.',
                icon: 'warning',
                confirmButtonColor: '#0A1428'
            });
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
        setCameraLoading(false);
    };

    const removeImage = () => {
        setAttachments({ ...attachments, imageFile: null });
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Convert dataURL to Blob for file handling
    const dataURLToBlob = (dataURL) => {
        const [header, data] = dataURL.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const bstr = atob(data);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
        }
        return new Blob([u8arr], { type: mime });
    };

    const handleSubmit = async () => {
        // Final validation before submit
        if (!validateStep(2)) {
            return;
        }

        setLoading(true);

        try {
            // Create FormData for file uploads
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.lastName);
            formDataToSend.append('birthday', formData.birthday);
            formDataToSend.append('nic', formData.nic);
            formDataToSend.append('phone', formData.phone);

            // Get spa_id from localStorage or use default
            const spaId = localStorage.getItem('spa_id') || '1';
            formDataToSend.append('spa_id', spaId);
            formDataToSend.append('name', `${formData.firstName} ${formData.lastName}`);
            formDataToSend.append('email', `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@spa.com`);
            formDataToSend.append('address', 'Spa Location'); // Default address
            formDataToSend.append('experience_years', '0');
            formDataToSend.append('specializations', JSON.stringify(['General Therapy']));

            // Append files (all are required at this point due to validation)
            formDataToSend.append('nicFile', attachments.nicFile);
            formDataToSend.append('medicalFile', attachments.medicalFile);
            formDataToSend.append('certificateFile', attachments.certificateFile);
            formDataToSend.append('profileImage', attachments.imageFile);

            // Send to the NEW backend endpoint
            const response = await fetch('/api/admin-spa-new/add-therapist', {
                method: 'POST',
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                // Add to local pending list for immediate UI update
                const newTherapist = {
                    id: result.therapist_id,
                    ...formData,
                    attachments,
                    addedDate: new Date().toLocaleDateString(),
                    status: 'pending'
                };
                setPendingTherapists([...pendingTherapists, newTherapist]);

                Swal.fire({
                    title: 'Success!',
                    text: 'Therapist added successfully! Sent to AdminLSA for approval.',
                    icon: 'success',
                    confirmButtonColor: '#0A1428'
                });

                // Reset form on success
                setCurrentStep(1);
                setFormData({ firstName: '', lastName: '', birthday: '', nic: '', phone: '' });
                setAttachments({ nicFile: null, medicalFile: null, certificateFile: null, imageFile: null });
                setImagePreview(null);
                setErrors({});
                setShowCamera(false);
                setCameraLoading(false);
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                }
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error submitting therapist:', error);
            let errorMessage = 'Failed to submit therapist registration. Please try again.';

            if (error.message.includes('Invalid NIC')) {
                errorMessage = 'Invalid NIC format. Please use format: 123456789V or 123456789X';
            } else if (error.message.includes('Invalid phone')) {
                errorMessage = 'Invalid phone format. Please use format: +94771234567';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSend = () => {
        if (selectedForBulk.length === 0) {
            Swal.fire({
                title: 'No Selection',
                text: 'Please select therapists to send',
                icon: 'warning',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        Swal.fire({
            title: 'Confirm Bulk Send',
            text: `Send ${selectedForBulk.length} therapist requests to AdminLSA?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0A1428',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Send All!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove selected therapists from pending list
                setPendingTherapists(pendingTherapists.filter(t => !selectedForBulk.includes(t.id)));
                setSelectedForBulk([]);

                Swal.fire({
                    title: 'Sent!',
                    text: 'All selected requests sent to AdminLSA',
                    icon: 'success',
                    confirmButtonColor: '#0A1428'
                });
            }
        });
    };

    const toggleSelection = (therapistId) => {
        setSelectedForBulk(prev =>
            prev.includes(therapistId)
                ? prev.filter(id => id !== therapistId)
                : [...prev, therapistId]
        );
    };

    // Cleanup effect for camera
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Therapist</h2>

                {/* Progress Bar */}
                <div className="flex items-center mb-8">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#0A1428] text-white' : 'bg-gray-200'}`}>
                        <FiUserPlus size={20} />
                    </div>
                    <div className={`flex-1 h-1 mx-4 ${currentStep > 1 ? 'bg-[#0A1428]' : 'bg-gray-200'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#0A1428] text-white' : 'bg-gray-200'}`}>
                        <FiHome size={20} />
                    </div>
                    <div className={`flex-1 h-1 mx-4 ${currentStep > 2 ? 'bg-[#0A1428]' : 'bg-gray-200'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#0A1428] text-white' : 'bg-gray-200'}`}>
                        <FiUsers size={20} />
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.firstName && <span className="text-red-500 text-sm mt-1 block">{errors.firstName}</span>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.lastName && <span className="text-red-500 text-sm mt-1 block">{errors.lastName}</span>}
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        name="birthday"
                                        placeholder="Birthday"
                                        value={formData.birthday}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.birthday ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.birthday && <span className="text-red-500 text-sm mt-1 block">{errors.birthday}</span>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="nic"
                                        placeholder="NIC Number (123456789V)"
                                        value={formData.nic}
                                        onChange={handleInputChange}
                                        maxLength="10"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.nic ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.nic && <span className="text-red-500 text-sm mt-1 block">{errors.nic}</span>}
                                </div>
                                <div className="md:col-span-1">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number (+94771234567)"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.phone && <span className="text-red-500 text-sm mt-1 block">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <h3 className="text-xl font-semibold text-gray-800">Document Attachments</h3>

                            {/* RELOCATED: Enhanced Therapist Image Module - Now at Top */}
                            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-100 shadow-sm">
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Therapist Profile Image</h4>
                                    <p className="text-sm text-gray-600 mb-6">Capture or upload your professional profile photo</p>

                                    {/* Square Preview Frame for Better Video Display */}
                                    <div className="relative mx-auto mb-6">
                                        <div className="w-64 h-64 rounded-2xl border-4 border-gray-200 overflow-hidden bg-black hover:border-[#D4AF37] transition-all duration-300 shadow-xl hover:shadow-2xl">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : showCamera || cameraLoading ? (
                                                <div className="relative w-full h-full">
                                                    {cameraLoading ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                                                            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#D4AF37] border-t-transparent mb-3"></div>
                                                            <p className="text-sm">Starting camera...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <video
                                                                ref={videoRef}
                                                                className="w-full h-full object-cover"
                                                                playsInline
                                                                muted
                                                                autoPlay
                                                                aria-label="Live camera preview - position your face to capture"
                                                            />
                                                            {/* Pink face guide overlay like WhatsApp */}
                                                            <div className="absolute inset-6 border-2 border-pink-400 rounded-lg opacity-70 pointer-events-none"></div>
                                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">📹 Live Camera</div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <FiCamera size={64} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Image Button */}
                                        {imagePreview && !showCamera && (
                                            <button
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                                                aria-label="Remove image"
                                            >
                                                <FiX size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Camera/Upload Controls */}
                                    {!showCamera ? (
                                        <div className="flex justify-center space-x-4 mb-4">
                                            {/* File Upload Button */}
                                            <label className="cursor-pointer bg-[#0A1428] text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:bg-[#1a2f4a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                                                <FiUpload size={18} />
                                                <span className="font-medium">Upload from Gallery</span>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg"
                                                    onChange={(e) => handleFileChange(e, 'imageFile')}
                                                    className="hidden"
                                                />
                                            </label>

                                            {/* Camera Button */}
                                            <button
                                                onClick={startCamera}
                                                disabled={cameraLoading}
                                                className="bg-[#D4AF37] text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:bg-[#B8941F] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                <FiCamera size={18} />
                                                <span className="font-medium">
                                                    {cameraLoading ? 'Starting...' : 'Open Camera'}
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        /* Camera Controls - WhatsApp Style */
                                        <div className="flex flex-col items-center space-y-4">
                                            {/* Pink Capture Button like WhatsApp */}
                                            <button
                                                onClick={capturePhoto}
                                                disabled={cameraLoading}
                                                className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-all duration-200 shadow-2xl hover:shadow-pink-500/25 transform hover:scale-110 relative disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                aria-label="Capture photo from live preview"
                                            >
                                                <span className="text-2xl">📸</span>
                                            </button>

                                            {/* Cancel Button */}
                                            <button
                                                onClick={stopCamera}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>

                                            <div className="text-center">
                                                <p className="text-sm text-gray-700 font-medium">Position your face and tap to capture</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Info */}
                                    {attachments.imageFile && !showCamera && (
                                        <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                                            <p className="text-sm text-green-700 font-semibold">✓ Profile Image Ready</p>
                                            <p className="text-xs text-green-600">{attachments.imageFile.name}</p>
                                        </div>
                                    )}

                                    {/* Instructions */}
                                    <div className="text-center mt-4">
                                        <p className="text-xs text-gray-500">
                                            Upload from gallery or capture with live camera • PNG, JPG only • Max 5MB
                                        </p>
                                    </div>

                                    {/* Hidden canvas for photo capture */}
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            </div>

                            {/* Other Document Attachments - Below Image Module */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">NIC Attachment (PDF, PNG, JPG) *</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => handleFileChange(e, 'nicFile')}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.nicFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.nicFile && <p className="text-sm text-red-500">✗ {errors.nicFile}</p>}
                                    {attachments.nicFile && !errors.nicFile && <p className="text-sm text-green-600">✓ {attachments.nicFile.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Medical Certificate (PDF, PNG, JPG) *</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => handleFileChange(e, 'medicalFile')}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.medicalFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.medicalFile && <p className="text-sm text-red-500">✗ {errors.medicalFile}</p>}
                                    {attachments.medicalFile && !errors.medicalFile && <p className="text-sm text-green-600">✓ {attachments.medicalFile.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Spa Center Certificate (PDF, PNG, JPG) *</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => handleFileChange(e, 'certificateFile')}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none ${errors.certificateFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.certificateFile && <p className="text-sm text-red-500">✗ {errors.certificateFile}</p>}
                                    {attachments.certificateFile && !errors.certificateFile && <p className="text-sm text-green-600">✓ {attachments.certificateFile.name}</p>}
                                </div>
                            </div>

                            {/* Profile Image Error */}
                            {errors.imageFile && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                    <p className="text-sm text-red-600">✗ {errors.imageFile}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Review & Finish</h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-start space-x-6">
                                    {/* Profile Image Preview */}
                                    {imagePreview && (
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37] overflow-hidden shadow-lg">
                                                <img
                                                    src={imagePreview}
                                                    alt="Therapist Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-xs text-center text-gray-500 mt-2">Profile Image</p>
                                        </div>
                                    )}

                                    {/* Information */}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-4">Review Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</div>
                                            <div><span className="font-medium">Birthday:</span> {formData.birthday}</div>
                                            <div><span className="font-medium">NIC:</span> {formData.nic}</div>
                                            <div><span className="font-medium">Phone:</span> {formData.phone}</div>
                                        </div>
                                        <div className="mt-4">
                                            <h5 className="font-medium text-gray-700 mb-2">Attachments:</h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className={attachments.nicFile ? 'text-green-600' : 'text-red-500'}>
                                                    NIC: {attachments.nicFile ? '✓ Uploaded' : '✗ Not uploaded'}
                                                </div>
                                                <div className={attachments.medicalFile ? 'text-green-600' : 'text-red-500'}>
                                                    Medical: {attachments.medicalFile ? '✓ Uploaded' : '✗ Not uploaded'}
                                                </div>
                                                <div className={attachments.certificateFile ? 'text-green-600' : 'text-red-500'}>
                                                    Certificate: {attachments.certificateFile ? '✓ Uploaded' : '✗ Not uploaded'}
                                                </div>
                                                <div className={attachments.imageFile ? 'text-green-600' : 'text-red-500'}>
                                                    Image: {attachments.imageFile ? '✓ Uploaded' : '✗ Not uploaded'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center px-6 py-3 rounded-lg font-medium ${currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <FiChevronLeft className="mr-2" /> Previous
                    </button>
                    <span className="text-gray-500">Step {currentStep} of 3</span>
                    {currentStep < 3 ? (
                        <button onClick={nextStep} className="flex items-center px-6 py-3 bg-[#0A1428] text-white rounded-lg font-medium hover:bg-[#1a2f4a]">
                            Next <FiChevronLeft className="ml-2 rotate-180" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex items-center px-8 py-3 rounded-lg font-medium ${loading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                'Add to Pending List'
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Pending Therapists Table */}
            {pendingTherapists.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Pending Therapist Requests</h3>
                        <button
                            onClick={handleBulkSend}
                            disabled={selectedForBulk.length === 0}
                            className="bg-[#0A1428] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1a2f4a] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send Selected to AdminLSA ({selectedForBulk.length})
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedForBulk(pendingTherapists.map(t => t.id));
                                                } else {
                                                    setSelectedForBulk([]);
                                                }
                                            }}
                                            checked={selectedForBulk.length === pendingTherapists.length && pendingTherapists.length > 0}
                                        />
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-800">NIC</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Phone</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Added Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTherapists.map((therapist) => (
                                    <tr key={therapist.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedForBulk.includes(therapist.id)}
                                                onChange={() => toggleSelection(therapist.id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4 font-medium">{therapist.firstName} {therapist.lastName}</td>
                                        <td className="py-3 px-4">{therapist.nic}</td>
                                        <td className="py-3 px-4">{therapist.phone}</td>
                                        <td className="py-3 px-4">{therapist.addedDate}</td>
                                        <td className="py-3 px-4">
                                            <button className="text-[#0A1428] hover:text-[#1a2f4a] font-medium">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Status helper functions
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'resigned':
            return 'bg-gray-100 text-gray-800';
        case 'terminated':
            return 'bg-purple-100 text-purple-800';
        case 'suspend':
        case 'suspended':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getDisplayStatus = (status) => {
    switch (status?.toLowerCase()) {
        case 'suspend':
            return 'Suspended';
        default:
            return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
};

// ViewTherapists Component - Dynamic Database Integration
const ViewTherapists = () => {
    const [activeTab, setActiveTab] = useState('approved');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get spa_id from localStorage or use default
    const spaId = localStorage.getItem('spa_id') || '1';

    // Fetch therapists from database
    const fetchTherapists = async (status = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin-spa-new/spas/${spaId}/therapists?status=${status}`);
            const data = await response.json();

            if (data.success) {
                setTherapists(data.therapists || []);
            } else {
                setError('Failed to fetch therapists');
                setTherapists([]);
            }
        } catch (err) {
            console.error('Error fetching therapists:', err);
            setError('Network error. Please check your connection.');
            setTherapists([]);
        } finally {
            setLoading(false);
        }
    };

    // Load therapists when component mounts or tab changes
    useEffect(() => {
        fetchTherapists(activeTab === 'all' ? 'all' : activeTab);
    }, [activeTab, spaId]);

    // Map database status to display status
    const getDisplayStatus = (dbStatus) => {
        const statusMap = {
            'approved': 'Active',
            'pending': 'Pending Review',
            'rejected': 'Rejected',
            'resigned': 'Resigned',
            'terminated': 'Terminated',
            'suspend': 'Suspended'
        };
        return statusMap[dbStatus] || dbStatus;
    };

    // Format therapist data for display
    const formatTherapist = (therapist) => ({
        id: therapist.id,
        name: therapist.first_name && therapist.last_name
            ? `${therapist.first_name} ${therapist.last_name}`
            : therapist.name || 'Unknown',
        email: therapist.email,
        nic: therapist.nic_number || therapist.nic,
        phone: therapist.phone,
        specialization: Array.isArray(therapist.specializations)
            ? therapist.specializations.join(', ')
            : (therapist.specializations ? JSON.parse(therapist.specializations || '[]').join(', ') : 'General Therapy'),
        status: getDisplayStatus(therapist.status),
        dbStatus: therapist.status,
        experience: `${therapist.experience_years || 0} years`,
        photo: therapist.therapist_image || '/api/placeholder/150/150',
        rejectionReason: therapist.reject_reason,
        dateOfBirth: therapist.date_of_birth,
        address: therapist.address,
        createdAt: therapist.created_at,
        updatedAt: therapist.updated_at
    });

    // Filter therapists based on search term and active tab
    const filteredTherapists = therapists
        .map(formatTherapist)
        .filter(therapist => {
            const matchesSearch =
                therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                therapist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                therapist.nic.includes(searchTerm) ||
                therapist.specialization.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTab = therapist.dbStatus === activeTab;

            return matchesSearch && matchesTab;
        });

    // Get therapist counts for each tab
    const getTherapistCounts = () => {
        const counts = {
            approved: therapists.filter(t => t.status === 'approved').length,
            pending: therapists.filter(t => t.status === 'pending').length,
            rejected: therapists.filter(t => t.status === 'rejected').length,
            resigned: therapists.filter(t => t.status === 'resigned').length,
            terminated: therapists.filter(t => t.status === 'terminated').length,
            suspended: therapists.filter(t => t.status === 'suspend').length
        };
        counts.all = Object.values(counts).reduce((sum, count) => sum + count, 0);
        return counts;
    };

    const counts = getTherapistCounts();

    const viewDetails = (therapist) => {
        setSelectedTherapist(therapist);
        setShowModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">View Therapists</h2>
                        <p className="text-gray-600 mt-1">Manage your spa therapist team</p>
                    </div>
                    <div className="text-sm text-gray-500">{filteredTherapists.length} therapist(s) found</div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search therapists by name, email, or NIC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] focus:border-transparent outline-none"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    {[
                        { key: 'approved', label: 'Approved' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'rejected', label: 'Rejected' },
                        { key: 'resigned', label: 'Resigned' },
                        { key: 'terminated', label: 'Terminated' },
                        { key: 'suspended', label: 'Suspended' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === tab.key
                                ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {tab.label} ({counts[tab.key] || 0})
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A1428] border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Loading therapists...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <FiX className="text-red-500 mr-2" size={20} />
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={() => fetchTherapists(activeTab)}
                                className="ml-auto text-red-600 hover:text-red-800 font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Therapists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTherapists.map((therapist) => (
                        <div key={therapist.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center space-x-3 mb-4">
                                <img
                                    src={therapist.photo}
                                    alt={therapist.name}
                                    className="w-16 h-16 rounded-full object-cover bg-gray-200"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="w-16 h-16 bg-[#0A1428] rounded-full hidden items-center justify-center text-white font-semibold">
                                    {therapist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${therapist.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        therapist.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {therapist.status}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div><span className="font-medium">Email:</span> {therapist.email}</div>
                                <div><span className="font-medium">NIC:</span> {therapist.nic}</div>
                                <div><span className="font-medium">Specialty:</span> {therapist.specialization}</div>
                                {activeTab === 'Rejected' && therapist.rejectionReason && (
                                    <div className="text-red-600"><span className="font-medium">Reason:</span> {therapist.rejectionReason}</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => viewDetails(therapist)}
                                    className="text-[#0A1428] hover:text-[#1a2f4a] font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTherapists.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No therapists found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Therapist Details Modal */}
            {showModal && selectedTherapist && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Therapist Profile</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex items-center space-x-6 mb-6">
                            <img
                                src={selectedTherapist.photo}
                                alt={selectedTherapist.name}
                                className="w-24 h-24 rounded-full object-cover bg-gray-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="w-24 h-24 bg-[#0A1428] rounded-full hidden items-center justify-center text-white font-bold text-2xl">
                                {selectedTherapist.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-800">{selectedTherapist.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTherapist.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    selectedTherapist.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {selectedTherapist.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block">Email</label>
                                    <p className="text-gray-800">{selectedTherapist.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block">Phone</label>
                                    <p className="text-gray-800">{selectedTherapist.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block">NIC</label>
                                    <p className="text-gray-800">{selectedTherapist.nic}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block">Specialization</label>
                                    <p className="text-gray-800">{selectedTherapist.specialization}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block">Experience</label>
                                    <p className="text-gray-800">{selectedTherapist.experience}</p>
                                </div>
                                {selectedTherapist.rejectionReason && (
                                    <div>
                                        <label className="text-sm font-medium text-red-600 block">Rejection Reason</label>
                                        <p className="text-red-800 bg-red-50 p-2 rounded">{selectedTherapist.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ResignTerminate Component with Dynamic Database Integration
const ResignTerminate = () => {
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [terminateReason, setTerminateReason] = useState('');
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get spa_id from localStorage or use default
    const spaId = localStorage.getItem('spa_id') || '1';

    // Fetch approved therapists from database
    const fetchApprovedTherapists = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin-spa-new/spas/${spaId}/therapists?status=approved`);
            const data = await response.json();

            if (data.success) {
                setTherapists(data.therapists || []);
            } else {
                setError('Failed to fetch approved therapists');
                setTherapists([]);
            }
        } catch (err) {
            console.error('Error fetching approved therapists:', err);
            setError('Network error. Please check your connection.');
            setTherapists([]);
        } finally {
            setLoading(false);
        }
    };

    // Load therapists on component mount
    useEffect(() => {
        fetchApprovedTherapists();
    }, [spaId]);

    const handleResign = (therapist) => {
        const therapistName = `${therapist.first_name} ${therapist.last_name}` || therapist.name;

        Swal.fire({
            title: 'Confirm Resignation',
            text: `Are you sure you want to resign ${therapistName}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Resign'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/admin-spa-new/therapists/${therapist.id}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            status: 'resigned',
                            reason: 'Voluntary resignation',
                            spa_id: spaId
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        Swal.fire({
                            title: 'Resigned!',
                            text: `${therapistName} has been resigned successfully.`,
                            icon: 'success',
                            confirmButtonColor: '#0A1428'
                        });
                        // Refresh the therapist list
                        fetchApprovedTherapists();
                    } else {
                        throw new Error(data.message || 'Failed to update therapist status');
                    }
                } catch (error) {
                    console.error('Error resigning therapist:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to resign therapist. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#0A1428'
                    });
                }
            }
        });
    };

    const handleTerminate = (therapist) => {
        setSelectedTherapist(therapist);
        setShowTerminateModal(true);
    };

    const submitTermination = async () => {
        if (!terminateReason.trim()) {
            Swal.fire({
                title: 'Reason Required',
                text: 'Please provide a reason for termination.',
                icon: 'warning',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        const therapistName = `${selectedTherapist.first_name} ${selectedTherapist.last_name}` || selectedTherapist.name;

        try {
            const response = await fetch(`/api/admin-spa-new/therapists/${selectedTherapist.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'terminated',
                    reason: terminateReason.trim(),
                    spa_id: spaId
                })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: 'Terminated!',
                    text: `${therapistName} has been terminated successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#0A1428'
                });

                // Refresh the therapist list
                fetchApprovedTherapists();

                // Close modal and reset
                setShowTerminateModal(false);
                setTerminateReason('');
                setSelectedTherapist(null);
            } else {
                throw new Error(data.message || 'Failed to terminate therapist');
            }
        } catch (error) {
            console.error('Error terminating therapist:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to terminate therapist. Please try again.',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
        }
    };

    // Format therapist data and filter
    const filteredTherapists = therapists
        .map(therapist => ({
            ...therapist,
            name: therapist.first_name && therapist.last_name
                ? `${therapist.first_name} ${therapist.last_name}`
                : therapist.name || 'Unknown',
            nic: therapist.nic_number || therapist.nic,
            specialization: Array.isArray(therapist.specializations)
                ? therapist.specializations.join(', ')
                : (therapist.specializations ? therapist.specializations : 'General Therapy')
        }))
        .filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.nic.includes(searchTerm) ||
            t.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manage Staff - Resign/Terminate</h2>
                        <p className="text-gray-600 mt-1">Manage approved therapists - resign or terminate</p>
                    </div>
                    <div className="text-sm text-gray-500">{filteredTherapists.length} approved therapist(s)</div>
                </div>

                <input
                    type="text"
                    placeholder="Search by NIC, email, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none"
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A1428] border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Loading approved therapists...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-2">⚠️</span>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={fetchApprovedTherapists}
                                className="ml-auto text-red-600 hover:text-red-800 font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTherapists.map((therapist) => (
                        <div key={therapist.therapist_id} className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-[#0A1428] rounded-full flex items-center justify-center text-white font-semibold">
                                    {therapist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                <div>Email: {therapist.email}</div>
                                <div>NIC: {therapist.nic}</div>
                                <div>Specialty: {therapist.specialization}</div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleResign(therapist)}
                                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600"
                                >
                                    Resign
                                </button>
                                <button
                                    onClick={() => handleTerminate(therapist)}
                                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600"
                                >
                                    Terminate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {!loading && filteredTherapists.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4 text-6xl">👥</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No approved therapists found</h3>
                        <p className="text-gray-600">
                            {searchTerm
                                ? 'No therapists match your search criteria.'
                                : 'No approved therapists available for resignation or termination.'
                            }
                        </p>
                    </div>
                )}

                {/* Terminate Modal with Required Reason */}
                {showTerminateModal && selectedTherapist && (
                    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Terminate {selectedTherapist.name}</h3>
                                <p className="text-gray-600">This action will be saved directly to the database</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Termination Reason (Required)
                                    </label>
                                    <textarea
                                        value={terminateReason}
                                        onChange={(e) => setTerminateReason(e.target.value)}
                                        rows="4"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1428] outline-none resize-none"
                                        placeholder="Enter detailed reason for termination..."
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowTerminateModal(false);
                                        setTerminateReason('');
                                        setSelectedTherapist(null);
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitTermination}
                                    disabled={!terminateReason.trim()}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Termination
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Quick Access Profile Component
const QuickProfile = () => {
    const [isOpen, setIsOpen] = useState(false);
    const profileData = {
        spaName: 'Ayura Wellness Spa',
        currentPlan: 'Annual (Expires: Dec 03, 2025)',
        usage: '24 Therapists | 18 Active Services',
        owner: 'Dr. Samantha Perera'
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Confirm Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0A1428',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                // Implement logout logic here
                console.log('Logging out...');
            }
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#b8941f] transition-colors"
            >
                A
            </button>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    A
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{profileData.spaName}</h3>
                                    <p className="text-sm text-gray-600">{profileData.owner}</p>
                                </div>
                            </div>
                        </div>

                        {/* System Details */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Plan:</span>
                                    <span className="font-medium text-green-600">Annual</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Expires:</span>
                                    <span className="text-gray-800">Dec 03, 2025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Therapists:</span>
                                    <span className="text-gray-800">24 Active</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Services:</span>
                                    <span className="text-gray-800">18 Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-2 py-2">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center"
                            >
                                <FiLogOut className="mr-2" size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const AdminSPA = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Socket.io connection
    const [socket, setSocket] = useState(null);

    // Initialize Socket.io connection
    useEffect(() => {
        const spaId = localStorage.getItem('spaId') || '1'; // Get from localStorage or default
        const newSocket = io('http://localhost:5000');

        newSocket.emit('join_spa', spaId);

        newSocket.on('connect', () => {
            console.log('Connected to server');
        });

        newSocket.on('therapist_status_update', (data) => {
            console.log('Received therapist status update:', data);

            // Add notification to state
            const newNotification = {
                id: Date.now(),
                type: data.status,
                message: data.message,
                timestamp: new Date().toISOString(),
                read: false
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show SweetAlert notification
            Swal.fire({
                icon: data.status === 'approved' ? 'success' : 'info',
                title: data.status === 'approved' ? 'Therapist Approved!' : 'Therapist Status Update',
                text: data.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Mark notifications as read
    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notification-container')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    // Navigation items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
        { id: 'payment-plans', label: 'Payment Plans', icon: <FiCreditCard size={20} /> },
        { id: 'notification-history', label: 'Notification History', icon: <FiBell size={20} /> },
        { id: 'add-therapist', label: 'Add Therapist', icon: <FiUserPlus size={20} /> },
        { id: 'view-therapists', label: 'View Therapists', icon: <FiUsers size={20} /> },
        { id: 'resign-terminate', label: 'Manage Staff', icon: <FiFilter size={20} /> },
        { id: 'spa-profile', label: 'Spa Profile', icon: <FiSettings size={20} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'payment-plans':
                return <PaymentPlans />;
            case 'notification-history':
                return <NotificationHistory />;
            case 'add-therapist':
                return <AddTherapist />;
            case 'view-therapists':
                return <ViewTherapists />;
            case 'resign-terminate':
                return <ResignTerminate />;
            case 'spa-profile':
                return <SpaProfile />;
            default:
                return <Dashboard />;
        }
    };

    const handleLogout = () => {
        console.log('Logging out...');
        // Implement logout logic
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleNavClick = (item) => {
        setActiveTab(item.id);
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:relative z-50 bg-[#0A1428] text-white transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-full flex flex-col
      `}>
                {/* Logo Section */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <img
                            src={assets.logo_trans}
                            alt="LSA Admin"
                            className={`transition-all duration-300 ${isSidebarOpen ? 'h-14' : 'h-10'}`}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwQTE0MjgiLz48dGV4dCB4PSIxMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0Q0QUYzNyI+TEFOS0EgU1BBIEFTU09DLjwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                    </div>

                    {isSidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/20 text-gold-500 hover:bg-gold-500 hover:text-[#0A1428] transition-all duration-300"
                            title="Collapse sidebar"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Show toggle button when sidebar is minimized */}
                {!isSidebarOpen && (
                    <div className="p-3 border-b border-gray-700 flex justify-center">
                        <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/20 text-gold-500 hover:bg-gold-500 hover:text-[#0A1428] transition-all duration-300"
                            title="Expand sidebar"
                        >
                            <FiChevronLeft size={18} className="transform rotate-180" />
                        </button>
                    </div>
                )}                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavClick(item)}
                                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-300 group
                    ${activeTab === item.id
                                            ? 'bg-gold-500 text-[#0A1428] shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }
                  `}
                                    title={!isSidebarOpen ? item.label : ''}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    <span className={`ml-3 transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip for minimized state */}
                                    {!isSidebarOpen && (
                                        <span className="absolute left-14 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 group"
                        title={!isSidebarOpen ? "Logout" : ""}
                    >
                        <FiLogOut size={20} />
                        <span className={`ml-3 transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
                            Logout
                        </span>

                        {!isSidebarOpen && (
                            <span className="absolute left-14 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                            <button
                                onClick={toggleMobileSidebar}
                                className="lg:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <FiMenu size={24} />
                            </button>
                            <h1 className="ml-4 text-xl font-semibold text-gray-800 capitalize">
                                {activeTab.replace(/-/g, ' ')}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <div className="relative notification-container">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiBell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                            <button
                                                onClick={clearAllNotifications}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                                            }`}
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-800">{notification.message}</p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(notification.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'approved' ? 'bg-green-500' :
                                                                notification.type === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                                                                }`}></div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <QuickProfile />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminSPA;

import React, { useState } from "react";
import Swal from 'sweetalert2';

// ProgressIndicator Component - Improved Design
const ProgressIndicator = ({ currentStep }) => {
  const steps = ["Initial", "Prerequisites", "Details", "Payment"];

  return (
    <div className="relative mb-12 mt-12">
      {/* Progress Track - Sleek modern line */}
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 z-0"></div>

      {/* Progress Fill - Premium gradient with subtle shine */}
      <div
        className="absolute top-5 h-[2px] bg-gradient-to-r from-[#0A1428] via-blue-600 to-blue-500 z-0 transition-all duration-700 ease-out"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 99}%` }}
      ></div>

      <div className="flex justify-between relative z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Step Circle - Modern premium design */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ease-out ${currentStep >= index + 1
                  ? "bg-gradient-to-br from-[#0A1428] to-blue-600 text-white shadow-2xl shadow-blue-500/30 transform scale-110 ring-2 ring-blue-700 ring-opacity-30"
                  : "bg-white border border-gray-200 text-gray-400 shadow-sm"
                } font-semibold relative`}
            >
              {/* Checkmark for completed steps */}
              {currentStep > index + 1 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}

              {/* Subtle glow effect for active steps */}
              {currentStep === index + 1 && (
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-pulse"></div>
              )}
            </div>

            {/* Step Label - Clean modern typography */}
            <div
              className={`text-sm font-medium tracking-wide transition-colors duration-300 ${currentStep >= index + 1
                  ? "text-gray-900 font-semibold"
                  : "text-gray-400"
                }`}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// InitialStep Component - Redesigned
const InitialStep = ({ onSelect }) => {
  return (
    <div className="text-center py-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl border border-gray-100 cursor-pointer group">
          <div className="w-20 h-20 bg-gradient-to-r from-gold-light to-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-primary-dark mb-3">
            Register
          </h3>
          <p className="text-gray-600 mb-6">
            Create a new professional account
          </p>
          <button
            onClick={() => onSelect("register")}
            className="bg-gradient-to-r from-gold-light to-gold text-primary-dark px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
          >
            Get Started
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl border border-gray-100 cursor-pointer group">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <i className="fas fa-sign-in-alt text-gray-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Login</h3>
          <p className="text-gray-600 mb-6">Access your existing account</p>
          <button
            onClick={() => onSelect("login")}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-200"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t border-gray-200 max-w-2xl mx-auto">
        <p>
          By proceeding, you agree to our{" "}
          <a href="#" className="text-gold hover:underline font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-gold hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

// PrerequisitesStep Component - Redesigned
const PrerequisitesStep = ({
  prerequisites,
  onPrerequisiteChange,
  onBack,
  onNext,
}) => {
  const allChecked = Object.values(prerequisites).every((value) => value);

  return (
    <div className="py-8">


      <div className="bg-gray-50 p-8 rounded-2xl mb-10 border border-gray-200">
        <div className="space-y-5">
          {[
            {
              id: "prereq1",
              name: "doc1",
              label:
                "Valid Government Issued ID (NIC/Passport/Driving License)",
            },
            {
              id: "prereq2",
              name: "doc2",
              label: "Business Registration Certificate",
            },
            {
              id: "prereq3",
              name: "doc3",
              label: "Tax Registration Documents",
            },
            {
              id: "prereq4",
              name: "doc4",
              label: "Spa Facility Photos (Minimum 5)",
            },
            {
              id: "prereq5",
              name: "doc5",
              label: "Professional Certifications of Staff",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start p-4 rounded-lg bg-white border border-gray-200 hover:border-gold transition-colors duration-300"
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id={item.id}
                  name={item.name}
                  checked={prerequisites[item.name]}
                  onChange={onPrerequisiteChange}
                  className="w-5 h-5 text-gold focus:ring-gold border-gray-300 rounded"
                />
              </div>
              <label htmlFor={item.id} className="ml-3 text-gray-700">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-white text-primary-dark border border-gray-300 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:border-gold hover:shadow-lg flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <button
          onClick={onNext}
          disabled={!allChecked}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${allChecked
              ? "bg-gradient-to-r from-gold-light to-gold text-primary-dark hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continue<i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

// UserDetailsStep Component - Redesigned
const UserDetailsStep = ({
  userDetails,
  onDetailChange,
  onFileUpload,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="py-0">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-primary-dark mb-6 pb-3 border-b border-gray-200">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={userDetails.firstName}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={userDetails.lastName}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                NIC No.
              </label>
              <input
                type="text"
                name="nicNo"
                value={userDetails.nicNo}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Telephone
              </label>
              <input
                type="tel"
                name="telephone"
                value={userDetails.telephone}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Cell Phone
              </label>
              <input
                type="tel"
                name="cellphone"
                value={userDetails.cellphone}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                NIC Front Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center transition-all duration-300 hover:border-gold hover:bg-white">
                <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
                <p className="text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "nicFront")}
                  className="hidden"
                  id="nicFront"
                  required
                />
                <label
                  htmlFor="nicFront"
                  className="mt-3 bg-gray-100 text-primary-dark px-5 py-2 rounded-lg inline-block cursor-pointer transition-all duration-300 hover:bg-gold-light"
                >
                  Select File
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                NIC Back Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center transition-all duration-300 hover:border-gold hover:bg-white">
                <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
                <p className="text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "nicBack")}
                  className="hidden"
                  id="nicBack"
                  required
                />
                <label
                  htmlFor="nicBack"
                  className="mt-3 bg-gray-100 text-primary-dark px-5 py-2 rounded-lg inline-block cursor-pointer transition-all duration-300 hover:bg-gold-light"
                >
                  Select File
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Spa Information */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-primary-dark mb-6 pb-3 border-b border-gray-200">
            Spa Information
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Spa Name
              </label>
              <input
                type="text"
                name="spaName"
                value={userDetails.spaName}
                onChange={onDetailChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                required
              />
            </div>

            {/* Updated Address Section */}
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Spa Address
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-600 mb-2 text-sm">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="spaAddressLine1"
                    value={userDetails.spaAddressLine1}
                    onChange={onDetailChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-2 text-sm">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    name="spaAddressLine2"
                    value={userDetails.spaAddressLine2}
                    onChange={onDetailChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-2 text-sm">
                    Province/State
                  </label>
                  <input
                    type="text"
                    name="spaProvince"
                    value={userDetails.spaProvince}
                    onChange={onDetailChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-2 text-sm">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="spaPostalCode"
                    value={userDetails.spaPostalCode}
                    onChange={onDetailChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Spa Telephone Number
                </label>
                <input
                  type="tel"
                  name="spaTelephone"
                  value={userDetails.spaTelephone}
                  onChange={onDetailChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Spa BR Number
                </label>
                <input
                  type="text"
                  name="spaBRNumber"
                  value={userDetails.spaBRNumber}
                  onChange={onDetailChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  BR Attachment
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center transition-all duration-300 hover:border-gold hover:bg-white">
                  <i className="fas fa-file-pdf text-gray-400 text-3xl mb-3"></i>
                  <p className="text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOC (Max 10MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => onFileUpload(e, "brAttachment")}
                    className="hidden"
                    id="brAttachment"
                    required
                  />
                  <label
                    htmlFor="brAttachment"
                    className="mt-3 bg-gray-100 text-primary-dark px-5 py-2 rounded-lg inline-block cursor-pointer transition-all duration-300 hover:bg-gold-light"
                  >
                    Select File
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Any Other Document (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center transition-all duration-300 hover:border-gold hover:bg-white">
                  <i className="fas fa-file-upload text-gray-400 text-3xl mb-3"></i>
                  <p className="text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, JPG (Max 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => onFileUpload(e, "otherDocument")}
                    className="hidden"
                    id="otherDocument"
                  />
                  <label
                    htmlFor="otherDocument"
                    className="mt-3 bg-gray-100 text-primary-dark px-5 py-2 rounded-lg inline-block cursor-pointer transition-all duration-300 hover:bg-gold-light"
                  >
                    Select File
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="bg-white text-primary-dark border border-gray-300 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:border-gold hover:shadow-lg flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-gold-light to-gold text-primary-dark px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center"
          >
            Continue<i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

// PaymentStep Component - Redesigned
const PaymentStep = ({ onBack, onPaymentSuccess }) => {
  const [saveCard, setSaveCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState('');

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');

    if (/^4/.test(cleaned)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleaned)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleaned)) {
      return 'amex';
    } else if (/^6(?:011|5)/.test(cleaned)) {
      return 'discover';
    } else {
      return '';
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);

    // Add space after every 4 digits
    return limitedDigits.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const input = e.target.value;
    const formatted = formatCardNumber(input);
    setCardNumber(formatted);

    // Detect and set card type
    const type = detectCardType(formatted);
    setCardType(type);
  };

  // Get card icon based on type
  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return 'fa-cc-visa';
      case 'mastercard':
        return 'fa-cc-mastercard';
      case 'amex':
        return 'fa-cc-amex';
      case 'discover':
        return 'fa-cc-discover';
      default:
        return 'fa-credit-card';
    }
  };

  return (
    <div className="py-0">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-primary-dark mb-6 pb-3 border-b border-gray-200">
            Payment Details
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Card Number
              </label>
              <div className="relative">
                <i className={`fas ${getCardIcon()} absolute left-4 top-1/2 transform -translate-y-1/2 ${cardType ? 'text-blue-500' : 'text-gray-400'}`}></i>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                  maxLength={19} // 16 digits + 3 spaces
                />
                {cardNumber && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {cardNumber.replace(/\s/g, '').length}/16
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  CVV
                </label>
                <div className="relative">
                  <i
                    className="fas fa-question-circle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-help"
                    title="3-digit code on the back of your card"
                  ></i>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-3 font-medium">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold transition-all duration-300"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center">
            <input
              type="checkbox"
              id="saveCard"
              checked={saveCard}
              onChange={() => setSaveCard(!saveCard)}
              className="mr-3 w-5 h-5 text-gold focus:ring-gold border-gray-300 rounded"
            />
            <label htmlFor="saveCard" className="text-gray-700">
              Save card details for future payments
            </label>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gold-light to-gold rounded-2xl p-8 text-primary-dark">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-credit-card text-white text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Registration Fee</h3>
            <p className="text-4xl font-bold my-3">LKR 5,000</p>
            <p className="text-primary-dark text-opacity-80">
              One-time payment for annual membership
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-5 mt-6">
            <h4 className="font-semibold mb-3">Membership Benefits</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i> Premium listing in
                our directory
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i> Exclusive
                networking events
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i> Professional
                certification
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i> Marketing support
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i> Industry insights &
                reports
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="bg-white text-primary-dark border border-gray-300 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:border-gold hover:shadow-lg flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <button
          onClick={onPaymentSuccess}
          className="bg-gradient-to-r from-gold-light to-gold text-primary-dark px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center"
        >
          Complete Payment<i className="fas fa-lock ml-2"></i>
        </button>
      </div>
    </div>
  );
};

// Main RegistrationPage Component
const Registration = () => {
  const [step, setStep] = useState(1);
  const [prerequisites, setPrerequisites] = useState({
    doc1: false,
    doc2: false,
    doc3: false,
    doc4: false,
    doc5: false,
  });

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    cellphone: "",
    nicNo: "",
    nicFront: null,
    nicBack: null,
    spaName: "",
    // Replaced single spaAddress with separate address fields
    spaAddressLine1: "",
    spaAddressLine2: "",
    spaProvince: "",
    spaPostalCode: "",
    spaTelephone: "",
    spaBRNumber: "",
    brAttachment: null,
    otherDocument: null,
  });

  // Handle user type selection
  const handleUserTypeSelect = (type) => {
    if (type === "register") {
      setStep(2);
    } else {
      // Redirect to login page
      console.log("Redirect to login page");
    }
  };

  // Handle prerequisite checkbox changes
  const handlePrerequisiteChange = (e) => {
    const { name, checked } = e.target;
    setPrerequisites({
      ...prerequisites,
      [name]: checked,
    });
  };

  // Handle user details form changes
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  // Handle file uploads
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    setUserDetails({
      ...userDetails,
      [fieldName]: file,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically validate and send data to your backend
    console.log("Form submitted:", userDetails);
    // Proceed to payment step
    setStep(4);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    // Here you would typically process payment and then save data
    Swal.fire({
      title: 'Payment Successful!',
      text: 'Payment processed successfully! Registration complete.',
      icon: 'success',
      confirmButtonColor: '#0A1428'
    });
    // Reset form or redirect to success page
  };

  // Get the appropriate header title based on current step
  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Lanka Spa Association Registration";
      case 2:
        return "Registration Prerequisites";
      case 3:
        return "Add your Spa & User Details";
      case 4:
        return "Add your payment details";
      default:
        return "Lanka Spa Association Registration";
    }
  };

  // Get the appropriate header subtitle based on current step
  const getHeaderSubtitle = () => {
    switch (step) {
      case 1:
        return "Premium Membership Application";
      case 2:
        return "To ensure a smooth registration process, please have the following documents ready before proceeding:";
      case 3:
        return "Please provide your details to complete registration";
      case 4:
        return "Secure payment processing";
      default:
        return "Premium Membership Application";
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1:
        return <InitialStep onSelect={handleUserTypeSelect} />;
      case 2:
        return (
          <PrerequisitesStep
            prerequisites={prerequisites}
            onPrerequisiteChange={handlePrerequisiteChange}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <UserDetailsStep
            userDetails={userDetails}
            onDetailChange={handleUserDetailsChange}
            onFileUpload={handleFileUpload}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        );
      case 4:
        return (
          <PaymentStep
            onBack={() => setStep(3)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      default:
        return <InitialStep onSelect={handleUserTypeSelect} />;
    }
  };

  return (
    <div className="min-h-auto bg-gradient-to-b from-gray-50 to-gray-100 py-0 px-0">
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-dark to-primary-darken py-10 px-10 text-black">
          <div className="text-center mb-6">
            <i className="fas fa-spa text-4xl text-gold mb-4"></i>
            <h1 className="text-4xl font-serif font-bold">
              {getHeaderTitle()}
            </h1>
            <p className="text-gold-light mt-2">
              {getHeaderSubtitle()}
            </p>
          </div>
          <ProgressIndicator currentStep={step} />
        </div>

        {/* Content Area */}
        <div className="px-10 pb-12">{renderStep()}</div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default Registration;
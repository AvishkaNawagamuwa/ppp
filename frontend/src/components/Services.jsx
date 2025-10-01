import React from 'react';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiMail, FiBookOpen, FiArrowRight } from 'react-icons/fi';

const Services = () => {
  const services = [
    {
      id: 1,
      title: "Spa Registration",
      description: "Register your spa with Lanka Spa Association to gain access to exclusive benefits, industry recognition, and professional resources.",
      icon: <FiUserPlus className="text-3xl text-[#D4AF37]" />,
      link: "/registration",
      buttonText: "Register Now",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      id: 2,
      title: "Contact Us",
      description: "Get in touch with our team for inquiries, support, or partnership opportunities. We're here to help you grow your spa business.",
      icon: <FiMail className="text-3xl text-[#D4AF37]" />,
      link: "/contact",
      buttonText: "Contact Us",
      gradient: "from-green-600 to-green-800"
    },
    {
      id: 3,
      title: "Instructions & Guidelines",
      description: "Access comprehensive guidelines, standards, and best practices for operating a spa in accordance with industry regulations.",
      icon: <FiBookOpen className="text-3xl text-[#D4AF37]" />,
      link: "/instructions",
      buttonText: "View Guidelines",
      gradient: "from-purple-600 to-purple-800"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-[#0A1428] to-[#152340] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light mb-4">Spa Resources & Services</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] mx-auto mb-4"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Access essential resources and services to elevate your spa business with Lanka Spa Association
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group relative">
              {/* Main Card */}
              <div className="bg-[#1c2c4d] rounded-2xl p-6 h-full flex flex-col transition-all duration-300 group-hover:translate-y-2 group-hover:shadow-2xl">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A1428] to-[#152340] flex items-center justify-center shadow-lg">
                    {service.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-300 mb-6 flex-grow">{service.description}</p>
                
                {/* Button */}
                <Link
                  to={service.link}
                  className="inline-flex items-center text-[#D4AF37] font-medium hover:text-[#BF9B30] transition-colors group/btn"
                >
                  {service.buttonText}
                  <FiArrowRight className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Link>
                
                {/* Hover effect background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
                
                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#D4AF37] opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 translate-x-4 -translate-y-4"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#D4AF37] opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 -translate-x-4 translate-y-4"></div>
                </div>
              </div>
              
              {/* Floating gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500 -z-20`}></div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="bg-[#1c2c4d] rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37] rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4AF37] rounded-full translate-x-24 translate-y-24"></div>
            </div>
            
            <h3 className="text-2xl font-semibold mb-4 relative z-10">Need Additional Assistance?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto relative z-10">
              Our dedicated support team is available to help you with any questions or concerns regarding registration, guidelines, or partnership opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                to="/help"
                className="px-6 py-3 bg-[#D4AF37] text-[#0A1428] font-medium rounded-lg hover:bg-[#BF9B30] transition-colors"
              >
                Get Help
              </Link>
              <Link
                to="/faq"
                className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] font-medium rounded-lg hover:bg-[#D4AF37] hover:text-[#0A1428] transition-colors"
              >
                View FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
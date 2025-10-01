const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-gold-500 font-light">Get in touch with our team</p>
          </div>
        </div>
      </div>

      {/* Contact Information - Inline */}
      <div className="bg-[#0A1428] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Office Location */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#0A1428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold-500">Office Location</h3>
                <p className="text-white">123 Business District<br/>Dubai, UAE</p>
              </div>
            </div>

            {/* Hotline Number */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#0A1428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold-500">Hotline</h3>
                <p className="text-white">+971 4 123 4567</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#0A1428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold-500">Email</h3>
                <p className="text-white">info@premiumbusiness.ae</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Contact Form Section */}
      <div className="max-w-full mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="w-full h-full min-h-[500px] bg-gray-100 rounded-2xl">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A1428] to-gray-900">
                <div className="text-center text-white p-8">
                  <svg className="w-20 h-20 mx-auto mb-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">Our Location</h3>
                  <p className="text-lg text-gold-500 mb-4">Dubai, United Arab Emirates</p>
                  <p className="text-gray-300">123 Business District<br/>Dubai International Financial Centre</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-[#0A1428] mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-8">We'll get back to you within 24 hours</p>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1428] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A1428] mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1428] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A1428] mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1428] mb-2">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A1428] text-white py-4 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Send Message
                <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
// Test script to verify registration success page works
// Open browser console and run this script

console.log('🧪 Testing Registration Success Page Display');

// Simulate registration data that would come from the backend
const testRegistrationData = {
    referenceNumber: 'LSA0001',
    spaName: 'Test Spa Credentials',
    ownerName: 'Test Owner',
    status: 'pending',
    credentials: {
        username: 'test0001',
        password: 'TestPass123',
        note: 'Please save these credentials securely'
    },
    loginInfo: {
        message: 'Use these credentials to access your spa dashboard',
        loginUrl: 'http://localhost:5173/login',
        note: 'You can change your password after logging in'
    }
};

// Store in localStorage (this simulates what the registration form does)
localStorage.setItem('recentRegistration', JSON.stringify(testRegistrationData));

console.log('✅ Test data stored in localStorage');
console.log('📄 Data:', testRegistrationData);
console.log('');
console.log('🔄 Redirecting to registration-success page...');

// Redirect to registration success page
window.location.href = '/registration-success';
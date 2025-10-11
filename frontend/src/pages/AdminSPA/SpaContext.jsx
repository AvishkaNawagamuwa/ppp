import React, { createContext, useContext, useState, useEffect } from 'react';

const SpaContext = createContext();

export const useSpaContext = () => {
    const context = useContext(SpaContext);
    if (!context) {
        throw new Error('useSpaContext must be used within a SpaContextProvider');
    }
    return context;
};

export const SpaContextProvider = ({ children }) => {
    const [spaData, setSpaData] = useState({
        subscriptionStatus: 'inactive', // 'active', 'inactive', 'expired'
        subscriptionPlan: null, // 'monthly', 'quarterly', 'half-yearly', 'annual'
        subscriptionExpiry: null,
        spaName: 'Loading...',
        ownerName: 'Loading...',
        therapistCount: 0,
        pendingRequests: 0,
        totalRevenue: 0,
        notifications: [],
        spaId: null,
        loading: true
    });

    const updateSubscription = (plan, status = 'active') => {
        const expiryDates = {
            monthly: 30,
            quarterly: 90,
            'half-yearly': 180,
            annual: 365
        };

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDates[plan]);

        setSpaData(prev => ({
            ...prev,
            subscriptionStatus: status,
            subscriptionPlan: plan,
            subscriptionExpiry: expiryDate.toISOString()
        }));
    };

    const addNotification = (notification) => {
        setSpaData(prev => ({
            ...prev,
            notifications: [notification, ...prev.notifications.slice(0, 4)] // Keep only 5 notifications
        }));
    };

    const updateTherapistCount = (count) => {
        setSpaData(prev => ({ ...prev, therapistCount: count }));
    };

    const updatePendingRequests = (count) => {
        setSpaData(prev => ({ ...prev, pendingRequests: count }));
    };

    // Fetch real spa data based on logged-in user
    useEffect(() => {
        const fetchSpaData = async () => {
            try {
                // Get user data from localStorage (set during login)
                const userData = localStorage.getItem('user');
                if (!userData) {
                    console.error('No user data found in localStorage');
                    setSpaData(prev => ({ ...prev, loading: false }));
                    return;
                }

                const user = JSON.parse(userData);
                console.log('Loading spa data for user:', user);

                if (!user.spa_id) {
                    console.error('No spa_id found in user data');
                    setSpaData(prev => ({ ...prev, loading: false }));
                    return;
                }

                // Fetch spa information from backend
                const response = await fetch(`http://localhost:3001/api/spa/profile/${user.spa_id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const spaInfo = await response.json();
                    console.log('Spa data loaded:', spaInfo);

                    setSpaData(prev => ({
                        ...prev,
                        spaId: user.spa_id,
                        spaName: spaInfo.data.name || 'Unknown Spa',
                        ownerName: `${spaInfo.data.owner_fname || ''} ${spaInfo.data.owner_lname || ''}`.trim() || 'Unknown Owner',
                        therapistCount: 8, // TODO: Fetch real count
                        pendingRequests: 2, // TODO: Fetch real count
                        totalRevenue: 450000, // TODO: Fetch real revenue
                        notifications: [
                            { id: 1, type: 'success', message: 'Welcome to your spa dashboard!', time: 'Just now' }
                        ],
                        loading: false
                    }));
                } else {
                    console.error('Failed to fetch spa data:', response.status);
                    setSpaData(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Failed to fetch spa data:', error);
                setSpaData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchSpaData();
    }, []);

    return (
        <SpaContext.Provider value={{
            ...spaData,
            updateSubscription,
            addNotification,
            updateTherapistCount,
            updatePendingRequests
        }}>
            {children}
        </SpaContext.Provider>
    );
};

export { SpaContext };

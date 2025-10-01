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
        spaName: 'Serenity Wellness Spa',
        ownerName: 'Priya Perera',
        therapistCount: 0,
        pendingRequests: 0,
        totalRevenue: 0,
        notifications: []
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

    // Simulate fetching data on mount
    useEffect(() => {
        // In real app, fetch from API
        const fetchSpaData = async () => {
            try {
                // Simulate API call
                setTimeout(() => {
                    setSpaData(prev => ({
                        ...prev,
                        therapistCount: 8,
                        pendingRequests: 2,
                        totalRevenue: 450000,
                        notifications: [
                            { id: 1, type: 'success', message: 'New therapist approval request', time: '2 hours ago' },
                            { id: 2, type: 'info', message: 'Monthly report is ready', time: '1 day ago' }
                        ]
                    }));
                }, 1000);
            } catch (error) {
                console.error('Failed to fetch spa data:', error);
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

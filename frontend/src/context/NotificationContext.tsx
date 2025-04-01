import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket'; // Import the custom hook
import { useAuth } from './AuthContext'; // To get user info if needed

// Define notification structure (adjust as needed)
interface NotificationPayload {
    message: string;
    postId?: number | string;
    commentId?: number;
    timestamp?: string;
    // Add other fields your backend might send
}

interface NotificationContextType {
    notifications: NotificationPayload[]; // Store multiple notifications
    notificationCount: number;
    addNotification: (notification: NotificationPayload) => void; // Maybe called by socket listener
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { socket, isConnected } = useSocket(); // Use the hook to get socket instance
    const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);

    const addNotification = useCallback((notification: NotificationPayload) => {
        console.log("[NotificationContext] Adding notification:", notification);
        // Add to list (e.g., keep last 10)
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        // Increment count
        setNotificationCount(prev => prev + 1);
        // Optional: Play sound, show browser notification
    }, []);

    const clearNotifications = useCallback(() => {
         console.log("[NotificationContext] Clearing notifications");
        setNotificationCount(0);
        // Optional: Clear the notifications array too if displaying a list
        // setNotifications([]);
    }, []);

    // Effect to set up socket listener when socket connects
    useEffect(() => {
        if (socket && isConnected) {
            console.log("[NotificationContext] Socket connected, setting up listener for 'new_notification'");

            // Listener function
            const handleNewNotification = (notification: NotificationPayload) => {
                addNotification(notification);
            };

            // Add listener
            socket.on('new_notification', handleNewNotification);

            // Cleanup listener on disconnect or unmount
            return () => {
                console.log("[NotificationContext] Cleaning up 'new_notification' listener");
                socket.off('new_notification', handleNewNotification);
            };
        }
    }, [socket, isConnected, addNotification]); // Rerun when socket connection status changes

    const value = {
        notifications,
        notificationCount,
        addNotification, // Expose if needed elsewhere, maybe not
        clearNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to consume the context
export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

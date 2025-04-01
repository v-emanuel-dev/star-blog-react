import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User } from '../types';
import { io, Socket } from 'socket.io-client';

interface NotificationPayload { 
  message: string; 
  postId: number | string; 
  commentId: number; 
  timestamp: string; 
}

// Create an array type for notifications
interface Notification extends NotificationPayload {
  id: string; // Unique ID for each notification
  read: boolean; // Track read status
}

type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'> | null;

interface AuthContextType {
  user: AuthUser;
  token: string | null;
  isLoading: boolean;
  isConnected: boolean;
  notificationCount: number;
  notifications: Notification[]; // Add notifications array
  clearNotifications: () => void;
  markNotificationsAsRead: () => void; // Add function to mark as read
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps { children: ReactNode; }
const SOCKET_URL = 'http://localhost:4000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  // Add notifications array state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const clearNotifications = useCallback(() => { 
    console.log("[AuthContext] Clearing all notifications");
    setNotifications([]);
    setNotificationCount(0); 
  }, []);
  
  // Add function to mark notifications as read without removing them
  const markNotificationsAsRead = useCallback(() => {
    console.log("[AuthContext] Marking notifications as read, current count:", notificationCount);
    if (notifications.length > 0) {
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, read: true }));
        console.log("[AuthContext] Updated notifications:", updated);
        return updated;
      });
      setNotificationCount(0);
    }
  }, [notifications, notificationCount]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log("[AuthContext] Disconnecting socket:", socketRef.current.id);
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out user");
    disconnectSocket();
    setToken(null); 
    setUser(null); 
    setNotificationCount(0);
    setNotifications([]); // Clear notifications on logout
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('authUser');
  }, [disconnectSocket]);

  const login = useCallback((userData: AuthUser, receivedToken: string) => {
    if (userData?.id && userData?.email && receivedToken) {
      const userToStore: AuthUser = { 
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl
      };
      console.log("AuthProvider: Storing user data", userToStore);
      setToken(receivedToken); 
      setUser(userToStore);
      try { 
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('authUser', JSON.stringify(userToStore));
      } catch (storageError) { 
        console.error("Failed to store auth data in localStorage", storageError);
        logout(); 
      }
    } else { 
      console.warn("Login called with invalid data", { userData, receivedToken });
      logout(); 
    }
  }, [logout]);

  // Effect for initial auth check
  useEffect(() => {
    console.log("AuthContext Initial Load: Starting check...");
    let initialStateSet = false;
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUserString = localStorage.getItem('authUser');
      if (storedToken && storedUserString) {
        const storedUser: AuthUser = JSON.parse(storedUserString);
        if (storedUser?.id && storedUser?.email) {
          setUser(storedUser);
          setToken(storedToken);
          console.log("AuthContext Initial Load: State set directly from storage.", storedUser);
          initialStateSet = true;
        } else {
          console.warn("AuthContext Initial Load: Invalid user data in storage.");
        }
      } else {
        console.log("AuthContext Initial Load: No token/user found in storage.");
      }
    } catch (error) {
      console.error("AuthContext Initial Load: Error reading/parsing localStorage", error);
    } finally {
      if (!initialStateSet) {
        logout();
      }
      setIsLoading(false);
      console.log("AuthContext Initial Load: Finished.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // useEffect for Socket connection
  useEffect(() => {
    if (token && !socketRef.current) {
      console.log("[AuthContext] Connecting socket with token...");
      
      socketRef.current = io(SOCKET_URL, {
        auth: { token }
      });
      
      socketRef.current.on('connect', () => {
        console.log("[AuthContext] Socket connected:", socketRef.current?.id);
        setIsConnected(true);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log("[AuthContext] Socket disconnected");
        setIsConnected(false);
      });
      
      // Update notification handling with more debugging
      socketRef.current.on('new_notification', (payload: NotificationPayload) => {
        console.log("[AuthContext] New notification received:", payload);
        
        // Create a new notification with ID and read status
        const newNotification: Notification = {
          ...payload,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false
        };
        
        console.log("[AuthContext] Adding notification to state:", newNotification);
        
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          console.log("[AuthContext] Updated notifications array:", updated);
          return updated;
        });
        
        setNotificationCount(prev => {
          const newCount = prev + 1;
          console.log("[AuthContext] Updated notification count:", newCount);
          return newCount;
        });
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error("[AuthContext] Socket connection error:", error.message);
        setIsConnected(false);
      });
    } else if (!token && socketRef.current) {
      disconnectSocket();
    }
    
    return () => {
      disconnectSocket();
    };
  }, [token, disconnectSocket]);

  // Make sure the notification count stays in sync with the unread notifications
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (notificationCount !== unreadCount) {
      console.log(`[AuthContext] Syncing notification count: ${notificationCount} → ${unreadCount}`);
      setNotificationCount(unreadCount);
    }
  }, [notifications, notificationCount]);

  const value: AuthContextType = { 
    user, 
    token, 
    isLoading, 
    isConnected,
    notificationCount, 
    notifications, // Add notifications to context
    clearNotifications, 
    markNotificationsAsRead, // Add new function to context
    login, 
    logout 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) { 
    throw new Error('useAuth must be used within an AuthProvider'); 
  }
  return context;
};

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "../hooks/useSocket";

interface NotificationPayload {
  message: string;
  postId?: number | string;
  commentId?: number;
  timestamp?: string;
}

interface NotificationContextType {
  notifications: NotificationPayload[];
  notificationCount: number;
  addNotification: (notification: NotificationPayload) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const addNotification = useCallback((notification: NotificationPayload) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
    setNotificationCount((prev) => prev + 1);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotificationCount(0);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) {
      return undefined;
    }

    const handleNewNotification = (notification: NotificationPayload) => {
      addNotification(notification);
    };

    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, isConnected, addNotification]);

  const value = {
    notifications,
    notificationCount,
    addNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

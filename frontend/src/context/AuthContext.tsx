import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { User } from "../types";

interface NotificationPayload {
  message: string;
  postId: number | string;
  commentId: number;
  timestamp: string;
}

interface Notification extends NotificationPayload {
  id: string;
  read: boolean;
}

type AuthUser = Pick<User, "id" | "email" | "name" | "avatarUrl"> | null;

interface AuthContextType {
  user: AuthUser;
  token: string | null;
  isLoading: boolean;
  isConnected: boolean;
  notificationCount: number;
  notifications: Notification[];
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const SOCKET_URL = "http://localhost:4000";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setNotificationCount(0);
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    if (notifications.length > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotificationCount(0);
    }
  }, [notifications]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    setToken(null);
    setUser(null);
    setNotificationCount(0);
    setNotifications([]);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, [disconnectSocket]);

  const login = useCallback(
    (userData: AuthUser, receivedToken: string) => {
      if (userData?.id && userData?.email && receivedToken) {
        const userToStore: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatarUrl: userData.avatarUrl,
        };
        setToken(receivedToken);
        setUser(userToStore);
        try {
          localStorage.setItem("authToken", receivedToken);
          localStorage.setItem("authUser", JSON.stringify(userToStore));
        } catch {
          setToken(null);
          setUser(null);
        }
      } else {
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUserString = localStorage.getItem("authUser");
      if (storedToken && storedUserString) {
        const storedUser: AuthUser = JSON.parse(storedUserString);
        if (storedUser?.id && storedUser?.email) {
          setUser(storedUser);
          setToken(storedToken);
        }
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token && !socketRef.current) {
      socketRef.current = io(SOCKET_URL, { auth: { token } });

      socketRef.current.on("connect", () => setIsConnected(true));
      socketRef.current.on("disconnect", () => setIsConnected(false));

      socketRef.current.on(
        "new_notification",
        (payload: NotificationPayload) => {
          const newNotification: Notification = {
            ...payload,
            id: `notif-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev]);
          setNotificationCount((prev) => prev + 1);
        }
      );

      socketRef.current.on("connect_error", () => setIsConnected(false));
    } else if (!token && socketRef.current) {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [token, disconnectSocket]);

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    if (notificationCount !== unreadCount) {
      setNotificationCount(unreadCount);
    }
  }, [notifications, notificationCount]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isConnected,
    notificationCount,
    notifications,
    clearNotifications,
    markNotificationsAsRead,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

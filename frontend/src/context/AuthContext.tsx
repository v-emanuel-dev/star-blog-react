import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';

// const artificialDelay = (ms: number): Promise<void> => { ... }; // Remove if done testing

type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'> | null;

interface AuthContextType {
  user: AuthUser;
  token: string | null;
  isLoading: boolean;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback((userData: AuthUser, receivedToken: string) => {
    if (userData?.id && userData?.email && receivedToken) {
        const userToStore: AuthUser = {
            id: userData.id,
            email: userData.email,
            name: userData.name || null,
            avatarUrl: userData.avatarUrl || null,
        };
        console.log("AuthProvider: Storing user data", userToStore);

        setToken(receivedToken);
        setUser(userToStore);

        try {
            localStorage.setItem('authToken', receivedToken);
            localStorage.setItem('authUser', JSON.stringify(userToStore));
            const storedUserCheck = localStorage.getItem('authUser');
            console.log("AuthProvider: Verified localStorage 'authUser':", storedUserCheck);
        } catch (storageError) {
            console.error("AuthProvider: Failed to write to localStorage", storageError);
        }
    } else {
        console.error("AuthProvider: Invalid data received in login", { userData, receivedToken });
        logout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally excluding logout

  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out user");
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
       try {
         const storedToken = localStorage.getItem('authToken');
         const storedUserString = localStorage.getItem('authUser');
         console.log("AuthProvider Initial Check: Stored Token?", !!storedToken);
         console.log("AuthProvider Initial Check: Stored User String?", storedUserString);
         if (storedToken && storedUserString) {
           const storedUser: AuthUser = JSON.parse(storedUserString);
            console.log("AuthProvider Initial Check: Parsed Stored User:", storedUser);
           if (storedUser?.id && storedUser?.email) {
                login(storedUser, storedToken);
           } else {
               console.warn("AuthProvider: Invalid parsed user data from localStorage.");
               logout();
           }
         } else {
            if (storedToken || storedUserString) logout();
         }
       } catch (error) {
           console.error("AuthProvider: Error reading or parsing localStorage", error);
           logout();
       } finally {
            // Optional: Remove delay
            // await artificialDelay(2000);
            setIsLoading(false);
       }
    };
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  const value: AuthContextType = { user, token, isLoading, login, logout };

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

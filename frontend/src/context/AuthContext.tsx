// src/context/AuthContext.tsx (Restore useEffect)
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';

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

  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out user");
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }, []);

  const login = useCallback((userData: AuthUser, receivedToken: string) => {
    console.log("AuthContext login function RECEIVED userData:", userData);
    if (userData?.id && userData?.email && receivedToken) {
        const userToStore: AuthUser = {
            id: userData.id,
            email: userData.email,
            name: userData.name || null,
            avatarUrl: userData.avatarUrl || null,
        };
        console.log("AuthProvider: Preparing to store user data:", userToStore);
        setToken(receivedToken);
        setUser(userToStore);
        try {
            localStorage.setItem('authToken', receivedToken);
            localStorage.setItem('authUser', JSON.stringify(userToStore));
            const storedUserCheck = localStorage.getItem('authUser');
            console.log("AuthProvider: Verified localStorage 'authUser' just after setting:", storedUserCheck);
        } catch (storageError) {
            console.error("AuthProvider: Failed to write to localStorage", storageError);
            logout(); // Call logout if storage fails
        }
    } else {
        console.error("AuthProvider: Invalid data received in login", { userData, receivedToken });
        logout();
    }
  }, [logout]); // Depends on logout


  // Restore original useEffect logic - calls login()
  useEffect(() => {
    const checkAuth = async () => {
       try {
         const storedToken = localStorage.getItem('authToken');
         const storedUserString = localStorage.getItem('authUser');
         console.log("AuthContext Initial Load: Reading Storage - Token?", !!storedToken, "User?", !!storedUserString);
         if (storedToken && storedUserString) {
           const storedUser: AuthUser = JSON.parse(storedUserString);
            console.log("AuthContext Initial Load: Parsed User", storedUser);
           if (storedUser?.id && storedUser?.email) {
                // Call login to set state from storage
                login(storedUser, storedToken);
           } else {
               console.warn("AuthContext Initial Load: Invalid parsed user data.");
               logout();
           }
         } else {
             console.log("AuthContext Initial Load: No token/user found.");
             if (storedToken || storedUserString) logout(); // Clean partial state
         }
       } catch (error) {
           console.error("AuthContext Initial Load: Error reading/parsing localStorage", error);
           logout();
       } finally {
            // Optional: Remove artificial delay
            // await artificialDelay(2000);
            setIsLoading(false);
             console.log("AuthContext Initial Load: Finished.");
       }
    };
    checkAuth();
  // useEffect should run once, login/logout are stable callbacks
  }, [login, logout]); // Dependencies are login/logout

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

// client/src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/authService';

interface UserContextType {
  user: { userId: number; displayName: string } | null;
  login: (userId: number, displayName: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ userId: number; displayName: string } | null>(null);

  useEffect(() => {
    // Check if user is already logged in on app start
    const savedUser = AuthService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (userId: number, displayName: string) => {
    const userData = { userId, displayName };
    setUser(userData);
    AuthService.saveUser(userData);
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
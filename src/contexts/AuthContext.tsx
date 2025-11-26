import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getFromStorage, saveToStorage, initializeStorage } from '../utils/mockData';
import { initializeExtendedStorage } from '../utils/extendedMockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with mock data
    initializeStorage();
    initializeExtendedStorage();
    
    // Check for existing session
    const sessionUser = getFromStorage('currentUser');
    if (sessionUser) {
      // Refresh user data from users array to get latest permissions
      refreshUserData(sessionUser.id);
    }
    setIsLoading(false);
  }, []);

  // Refresh user data from the users array
  const refreshUserData = (userId: string) => {
    const users: User[] = getFromStorage('users', []);
    const updatedUser = users.find(u => u.id === userId);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      saveToStorage('currentUser', updatedUser);
    }
  };

  // Public refresh function that can be called from anywhere
  const refreshUser = () => {
    if (currentUser?.id) {
      refreshUserData(currentUser.id);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const users: User[] = getFromStorage('users', []);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Check if user is active
      if (user.isActive === false) {
        return { success: false, message: 'Your account has been deactivated. Please contact admin.' };
      }
      
      setCurrentUser(user);
      saveToStorage('currentUser', user);
      return { success: true };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
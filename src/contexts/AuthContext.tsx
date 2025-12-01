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
    
    // CRITICAL: Ensure SuperAdmin accounts are always active
    const ensureSuperAdminActive = () => {
      const users: User[] = getFromStorage('users', []);
      let hasChanges = false;
      
      const updatedUsers = users.map(user => {
        if (user.role === 'super_admin' && user.isActive !== true) {
          console.log('🔒 SYSTEM: Activating SuperAdmin account:', user.email);
          hasChanges = true;
          return { ...user, isActive: true };
        }
        return user;
      });
      
      if (hasChanges) {
        saveToStorage('users', updatedUsers);
        console.log('✅ SYSTEM: SuperAdmin accounts activated');
      }
    };
    
    ensureSuperAdminActive();
    
    // Check for existing session
    const sessionUser = getFromStorage('currentUser');
    if (sessionUser) {
      // Refresh user data from users array to get latest permissions
      const users: User[] = getFromStorage('users', []);
      const updatedUser = users.find(u => u.id === sessionUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        saveToStorage('currentUser', updatedUser);
      } else {
        // If user not found in users array but exists in currentUser, use it anyway
        // This can happen with newly created users from Email OTP
        setCurrentUser(sessionUser);
      }
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
    console.log('🔍 Login attempt:', { email, totalUsers: users.length });
    console.log('📋 Available users:', users.map(u => ({ email: u.email, role: u.role, isActive: u.isActive })));
    
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      console.log('✅ User found:', { email: user.email, role: user.role, isActive: user.isActive });
      
      // Check if user is active
      if (user.isActive === false) {
        console.log('❌ User is inactive');
        return { success: false, message: 'Your account has been deactivated. Please contact admin.' };
      }
      
      console.log('✅ Login successful');
      setCurrentUser(user);
      saveToStorage('currentUser', user);
      return { success: true };
    }

    console.log('❌ User not found with provided credentials');
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
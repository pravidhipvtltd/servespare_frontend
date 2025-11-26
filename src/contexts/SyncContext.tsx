// Sync Context - Real-time synchronization for language changes
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFromStorage } from '../utils/mockData';
import { useAuth } from './AuthContext';

interface SyncContextType {
  lastUpdate: number;
  forceRefresh: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { currentUser } = useAuth();

  const forceRefresh = () => {
    setLastUpdate(Date.now());
  };

  // Check for language changes every 3 seconds
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const currentLanguage = getFromStorage('systemLanguage', 'en');
      const lastKnownLanguage = localStorage.getItem('lastKnownLanguage');
      
      if (currentLanguage !== lastKnownLanguage) {
        console.log('🌍 Language changed from', lastKnownLanguage, 'to', currentLanguage);
        localStorage.setItem('lastKnownLanguage', currentLanguage);
        forceRefresh();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen for language changes via storage events
  useEffect(() => {
    if (!currentUser) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'systemLanguage') {
        console.log('📡 Language changed via storage event - refreshing...');
        forceRefresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  return (
    <SyncContext.Provider value={{ lastUpdate, forceRefresh }}>
      {children}
    </SyncContext.Provider>
  );
};
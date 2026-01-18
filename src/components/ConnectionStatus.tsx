import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Server, HardDrive } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkBackendStatus = async () => {
    setChecking(true);
    // Frontend-only mode - always use local storage
    setIsBackendAvailable(false);
    setChecking(false);
  };

  useEffect(() => {
    checkBackendStatus();
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isBackendAvailable === null && checking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-gray-600">Checking...</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
        isBackendAvailable 
          ? 'bg-green-50 text-green-700 hover:bg-green-100' 
          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
      }`}
      onClick={checkBackendStatus}
      title={isBackendAvailable ? 'Backend connected - Click to refresh' : 'LocalStorage mode - Click to retry'}
    >
      {isBackendAvailable ? (
        <>
          <Server className="w-4 h-4" />
          <span className="font-medium">Backend</span>
        </>
      ) : (
        <>
          <HardDrive className="w-4 h-4" />
          <span className="font-medium">Local Mode</span>
        </>
      )}
    </div>
  );
};

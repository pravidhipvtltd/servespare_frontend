import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export const ManualSyncButton: React.FC = () => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    
    // Trigger a custom event that all components can listen to
    window.dispatchEvent(new CustomEvent('manualSync', { detail: { timestamp: Date.now() } }));
    
    setTimeout(() => {
      setSyncing(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        syncing
          ? 'bg-green-500 text-white cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
      title="Manually sync all data"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
    </button>
  );
};

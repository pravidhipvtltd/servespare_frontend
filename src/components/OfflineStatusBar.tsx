import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { offlineDetector } from "../utils/sync/offlineDetection";
import { syncManager } from "../utils/sync/syncManager";
import { getSyncQueueStats } from "../utils/sync/syncQueue";

export const OfflineStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState(offlineDetector.getStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [failedChanges, setFailedChanges] = useState(0);

  useEffect(() => {
    // Listen to online/offline status
    const unsubscribe = offlineDetector.addListener((online) => {
      setIsOnline(online);
    });

    // Listen to sync events
    const unsubscribeSync = syncManager.addSyncCallback((stats) => {
      setPendingChanges(stats.pending);
      setFailedChanges(stats.failed);
      updateLastSyncTime();
    });

    // Initial load
    loadSyncStats();
    updateLastSyncTime();

    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, []);

  const loadSyncStats = async () => {
    const stats = await getSyncQueueStats();
    setPendingChanges(stats.pending);
    setFailedChanges(stats.failed);
  };

  const updateLastSyncTime = async () => {
    const time = await syncManager.getLastSyncTime();
    setLastSyncTime(time);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncManager.forceSyncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSyncTime = (time: string | null): string => {
    if (!time) return "Never";

    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Don't show if online and no pending changes
  if (isOnline && pendingChanges === 0 && failedChanges === 0) {
    return null;
  }

  return <div></div>;
};

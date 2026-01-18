/**
 * Electron Utilities
 * Helper functions to detect and interact with Electron desktop app
 */

// Type definition for Electron API exposed via preload
interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getAppPath: (name: string) => Promise<string>;
  isDesktopApp: () => Promise<boolean>;
  isOfflineCapable: () => Promise<boolean>;
  getUserDataPath: () => Promise<string>;
  getNetworkStatus: () => Promise<boolean>;
  platform: string;
  arch: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

// Extend Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Check if app is running in Electron desktop mode
 */
export const isElectronApp = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

/**
 * Get app version from Electron
 */
export const getElectronVersion = async (): Promise<string | null> => {
  if (!isElectronApp()) return null;
  try {
    return await window.electronAPI!.getAppVersion();
  } catch (error) {
    console.error('Failed to get Electron version:', error);
    return null;
  }
};

/**
 * Get user data path (for storing app data)
 */
export const getUserDataPath = async (): Promise<string | null> => {
  if (!isElectronApp()) return null;
  try {
    return await window.electronAPI!.getUserDataPath();
  } catch (error) {
    console.error('Failed to get user data path:', error);
    return null;
  }
};

/**
 * Check network status via Electron
 */
export const getNetworkStatus = async (): Promise<boolean> => {
  if (!isElectronApp()) {
    // Fallback to browser API
    return navigator.onLine;
  }
  try {
    return await window.electronAPI!.getNetworkStatus();
  } catch (error) {
    console.error('Failed to get network status:', error);
    return navigator.onLine;
  }
};

/**
 * Get platform info
 */
export const getPlatformInfo = (): { platform: string; arch: string } | null => {
  if (!isElectronApp()) return null;
  return {
    platform: window.electronAPI!.platform,
    arch: window.electronAPI!.arch,
  };
};

/**
 * Get runtime versions
 */
export const getRuntimeVersions = (): { node: string; chrome: string; electron: string } | null => {
  if (!isElectronApp()) return null;
  return window.electronAPI!.versions;
};

/**
 * Check if offline mode is fully supported
 */
export const isOfflineSupported = async (): Promise<boolean> => {
  if (!isElectronApp()) {
    // Web version has limited offline support
    return 'indexedDB' in window;
  }
  try {
    return await window.electronAPI!.isOfflineCapable();
  } catch (error) {
    console.error('Failed to check offline capability:', error);
    return false;
  }
};

/**
 * Log app environment info
 */
export const logEnvironmentInfo = async (): Promise<void> => {
  if (isElectronApp()) {
    const version = await getElectronVersion();
    const platform = getPlatformInfo();
    const versions = getRuntimeVersions();
    const userDataPath = await getUserDataPath();
    
    console.log('🖥️ [Environment] Running in Electron Desktop App');
    console.log('📦 [Version]', version);
    console.log('🌐 [Platform]', platform);
    console.log('⚙️ [Runtime]', versions);
    console.log('📁 [User Data]', userDataPath);
  } else {
    console.log('🌐 [Environment] Running in Web Browser');
    console.log('🔍 [User Agent]', navigator.userAgent);
    console.log('💾 [IndexedDB]', 'indexedDB' in window ? 'Supported' : 'Not Supported');
  }
};

export default {
  isElectronApp,
  getElectronVersion,
  getUserDataPath,
  getNetworkStatus,
  getPlatformInfo,
  getRuntimeVersions,
  isOfflineSupported,
  logEnvironmentInfo,
};

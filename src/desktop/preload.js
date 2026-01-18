/**
 * Electron Preload Script
 * Bridge between main process and renderer (security layer)
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
  isDesktopApp: () => ipcRenderer.invoke('is-desktop-app'),
  
  // Offline capabilities
  isOfflineCapable: () => ipcRenderer.invoke('is-offline-capable'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getNetworkStatus: () => ipcRenderer.invoke('get-network-status'),
  
  // Platform info
  platform: process.platform,
  arch: process.arch,
  
  // Node info (safe subset)
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

console.log('🔒 [Preload] Security bridge initialized');
console.log('🖥️ [Platform]', process.platform, process.arch);
console.log('⚡ [Electron]', process.versions.electron);
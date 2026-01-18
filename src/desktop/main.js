/**
 * Electron Main Process
 * Desktop app entry point with offline-first capabilities
 */

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // Enable offline storage
      partition: 'persist:servespares',
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Serve Spares - Inventory System',
    backgroundColor: '#0a0a0a',
    show: false, // Don't show until ready
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ [Electron] Window displayed');
  });

  // Load the app
  if (isDev) {
    // Development mode - connect to Vite dev server
    mainWindow.loadURL('http://localhost:5173?mode=desktop');
    mainWindow.webContents.openDevTools();
    console.log('🔧 [Electron] Development mode - Connected to dev server');
  } else {
    // Production mode - load built files
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('❌ [Electron] Failed to load app:', err);
      // Show error dialog
      const { dialog } = require('electron');
      dialog.showErrorBox(
        'Failed to Load App',
        'Could not find the application files. Please reinstall the app.\n\nError: ' + err.message
      );
    });
    console.log('🚀 [Electron] Production mode - Loading from:', indexPath);
  }

  // Custom menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload(),
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Serve Spares',
              message: 'Serve Spares - Inventory System',
              detail: `Version: ${app.getVersion()}\n\nComplete inventory management solution for auto parts.\n\nOffline-first • Multi-role • Real-time Sync`,
            });
          },
        },
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://servespares.com/docs');
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // Handle window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation to external URLs (security)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    // Allow dev server and local files only
    if (isDev && parsedUrl.origin === 'http://localhost:5173') {
      return; // Allow
    }
    if (!isDev && parsedUrl.protocol === 'file:') {
      return; // Allow
    }
    // Block all other navigation
    event.preventDefault();
    console.warn('⚠️ [Security] Blocked navigation to:', url);
  });

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const { shell } = require('electron');
    shell.openExternal(url);
    return { action: 'deny' }; // Don't open in Electron
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  console.log('🖥️ [Electron] App ready - Version:', app.getVersion());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for desktop features
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('is-desktop-app', () => {
  return true;
});

// Check if running in desktop mode
ipcMain.handle('is-offline-capable', () => {
  return true; // Desktop app has full offline support
});

// Get user data path for local storage
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// Network status (though browser APIs work too)
ipcMain.handle('get-network-status', () => {
  const { net } = require('electron');
  return net.isOnline();
});

console.log('🖥️ [Electron] Main process started');
console.log('📦 [Storage] User data path:', app.getPath('userData'));
console.log('🌐 [Mode]', isDev ? 'Development' : 'Production');
/**
 * Offline Detection System
 * Detects online/offline status and manages sync triggers
 */

type ConnectionCallback = (isOnline: boolean) => void;

class OfflineDetector {
  private isOnline: boolean = navigator.onLine;
  private listeners: ConnectionCallback[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Listen to browser online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  private handleOnline = () => {
    this.updateStatus(true);
  };

  private handleOffline = () => {
    this.updateStatus(false);
  };

  private updateStatus(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.isOnline);
      } catch (error) {
        // Silent error handling
      }
    });
  }

  /**
   * Add listener for connection status changes
   */
  public addListener(callback: ConnectionCallback): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get current online status
   */
  public getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Cleanup
   */
  public destroy() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    this.listeners = [];
  }
}

// Singleton instance
export const offlineDetector = new OfflineDetector();

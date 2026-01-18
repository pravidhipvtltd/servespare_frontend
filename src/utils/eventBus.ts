/**
 * Event Bus for Real-time System Events
 * Provides centralized event management for inventory updates
 */

export type SystemEvent = 
  | 'IMPORT_COMPLETE'
  | 'ITEM_UPDATED'
  | 'ITEM_CREATED'
  | 'ITEM_DELETED'
  | 'CATEGORY_UPDATED'
  | 'BRAND_UPDATED';

interface EventPayload {
  timestamp: string;
  source: string;
  data?: any;
}

/**
 * Emit a system event
 * @param eventName - Name of the event to emit
 * @param payload - Optional payload data
 */
export const emitEvent = (eventName: SystemEvent, payload?: any) => {
  const eventData: EventPayload = {
    timestamp: new Date().toISOString(),
    source: 'inventory-system',
    data: payload,
  };

  // Dispatch custom event
  const event = new CustomEvent(eventName, { detail: eventData });
  window.dispatchEvent(event);

  // Also update localStorage trigger for cross-tab sync
  const storageEvent = {
    event: eventName,
    ...eventData,
  };
  localStorage.setItem('lastSystemEvent', JSON.stringify(storageEvent));

  // Log for debugging
  console.log(`🔔 Event Emitted: ${eventName}`, eventData);
};

/**
 * Listen for a system event
 * @param eventName - Name of the event to listen for
 * @param callback - Callback function to execute when event fires
 * @returns Cleanup function to remove the listener
 */
export const listenToEvent = (
  eventName: SystemEvent,
  callback: (payload: EventPayload) => void
): (() => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail);
  };

  window.addEventListener(eventName, handler);

  // Return cleanup function
  return () => {
    window.removeEventListener(eventName, handler);
  };
};

/**
 * Listen for multiple system events
 * @param eventNames - Array of event names to listen for
 * @param callback - Callback function to execute when any event fires
 * @returns Cleanup function to remove all listeners
 */
export const listenToMultipleEvents = (
  eventNames: SystemEvent[],
  callback: (eventName: SystemEvent, payload: EventPayload) => void
): (() => void) => {
  const cleanupFunctions: (() => void)[] = [];

  eventNames.forEach((eventName) => {
    const cleanup = listenToEvent(eventName, (payload) => {
      callback(eventName, payload);
    });
    cleanupFunctions.push(cleanup);
  });

  // Return cleanup function that removes all listeners
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
};

/**
 * Listen for localStorage changes across tabs
 * Allows real-time sync between multiple browser tabs
 */
export const listenForCrossTabEvents = (
  callback: (eventName: string, payload: any) => void
): (() => void) => {
  const handler = (e: StorageEvent) => {
    if (e.key === 'lastSystemEvent' && e.newValue) {
      try {
        const eventData = JSON.parse(e.newValue);
        callback(eventData.event, eventData);
      } catch (error) {
        console.error('Error parsing storage event:', error);
      }
    }
  };

  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('storage', handler);
  };
};

/**
 * Emit IMPORT_COMPLETE event
 * Call this after bulk CSV import completes
 */
export const emitImportComplete = (importStats: {
  totalRows: number;
  successCount: number;
  errorCount: number;
}) => {
  emitEvent('IMPORT_COMPLETE', importStats);
};

/**
 * Emit ITEM_UPDATED event
 * Call this after manual item update
 */
export const emitItemUpdated = (itemId: string, itemData: any) => {
  emitEvent('ITEM_UPDATED', { itemId, itemData });
};

/**
 * Emit ITEM_CREATED event
 * Call this after manual item creation
 */
export const emitItemCreated = (itemId: string, itemData: any) => {
  emitEvent('ITEM_CREATED', { itemId, itemData });
};

/**
 * Emit ITEM_DELETED event
 * Call this after item deletion
 */
export const emitItemDeleted = (itemId: string) => {
  emitEvent('ITEM_DELETED', { itemId });
};

/**
 * Emit CATEGORY_UPDATED event
 * Call this after category changes
 */
export const emitCategoryUpdated = () => {
  emitEvent('CATEGORY_UPDATED', {});
};

/**
 * Emit BRAND_UPDATED event
 * Call this after brand changes
 */
export const emitBrandUpdated = () => {
  emitEvent('BRAND_UPDATED', {});
};

// Export for use in components
export default {
  emitEvent,
  listenToEvent,
  listenToMultipleEvents,
  listenForCrossTabEvents,
  emitImportComplete,
  emitItemUpdated,
  emitItemCreated,
  emitItemDeleted,
  emitCategoryUpdated,
  emitBrandUpdated,
};

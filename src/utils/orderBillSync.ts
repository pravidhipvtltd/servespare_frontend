import { getFromStorage, saveToStorage } from './mockData';
import { Bill, InventoryItem } from '../types';

/**
 * Sync orders with bills - automatically update order status when bill is created
 * and update inventory for purchase orders
 */

interface Order {
  id: string;
  orderNumber: string;
  type: 'purchase' | 'sales';
  partyId: string;
  partyName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'received';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  expectedDeliveryDate?: string;
  workspaceId?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

/**
 * Update order status when bill is created
 */
export const updateOrderOnBillCreation = (orderId: string, orderType: 'purchase' | 'sales'): boolean => {
  try {
    const storageKey = orderType === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const orders = getFromStorage(storageKey, []);
    
    const updatedOrders = orders.map((order: Order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: orderType === 'purchase' ? 'received' : 'delivered',
          updatedAt: new Date().toISOString(),
        };
      }
      return order;
    });
    
    saveToStorage(storageKey, updatedOrders);
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
};

/**
 * Update inventory when purchase order is received
 */
export const updateInventoryFromPurchaseOrder = (orderId: string, workspaceId?: string): boolean => {
  try {
    const purchaseOrders = getFromStorage('purchaseOrders', []);
    const order = purchaseOrders.find((o: Order) => o.id === orderId);
    
    if (!order || order.type !== 'purchase') {
      console.error('Purchase order not found');
      return false;
    }
    
    const inventory = getFromStorage('inventory', []);
    let inventoryUpdated = false;
    
    const updatedInventory = inventory.map((item: InventoryItem) => {
      const orderItem = order.items.find((oi: OrderItem) => oi.id === item.id);
      
      if (orderItem) {
        inventoryUpdated = true;
        return {
          ...item,
          quantity: item.quantity + orderItem.quantity,
          lastRestocked: new Date().toISOString(),
        };
      }
      
      return item;
    });
    
    if (inventoryUpdated) {
      saveToStorage('inventory', updatedInventory);
      
      // Create transaction records for inventory updates
      const transactions = getFromStorage('transactions', []);
      const newTransactions = order.items.map((orderItem: OrderItem) => ({
        id: `txn-${Date.now()}-${Math.random()}`,
        itemId: orderItem.id,
        type: 'in',
        quantity: orderItem.quantity,
        price: orderItem.price,
        customerName: order.partyName || 'Purchase Order',
        notes: `Purchase Order: ${order.orderNumber}`,
        workspaceId: workspaceId,
        createdAt: new Date().toISOString(),
      }));
      
      saveToStorage('transactions', [...transactions, ...newTransactions]);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return false;
  }
};

/**
 * Update inventory when sales order is delivered (bill created)
 */
export const updateInventoryFromSalesOrder = (orderId: string, workspaceId?: string): boolean => {
  try {
    const salesOrders = getFromStorage('salesOrders', []);
    const order = salesOrders.find((o: Order) => o.id === orderId);
    
    if (!order || order.type !== 'sales') {
      console.error('Sales order not found');
      return false;
    }
    
    const inventory = getFromStorage('inventory', []);
    let inventoryUpdated = false;
    
    const updatedInventory = inventory.map((item: InventoryItem) => {
      const orderItem = order.items.find((oi: OrderItem) => oi.id === item.id);
      
      if (orderItem) {
        inventoryUpdated = true;
        return {
          ...item,
          quantity: Math.max(0, item.quantity - orderItem.quantity),
        };
      }
      
      return item;
    });
    
    if (inventoryUpdated) {
      saveToStorage('inventory', updatedInventory);
      
      // Create transaction records for inventory updates
      const transactions = getFromStorage('transactions', []);
      const newTransactions = order.items.map((orderItem: OrderItem) => ({
        id: `txn-${Date.now()}-${Math.random()}`,
        itemId: orderItem.id,
        type: 'out',
        quantity: orderItem.quantity,
        price: orderItem.price,
        customerName: order.partyName || 'Sales Order',
        notes: `Sales Order: ${order.orderNumber}`,
        workspaceId: workspaceId,
        createdAt: new Date().toISOString(),
      }));
      
      saveToStorage('transactions', [...transactions, ...newTransactions]);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return false;
  }
};

/**
 * Get pending orders for party (for bill creation dropdown)
 */
export const getPendingOrdersForParty = (partyId: string, orderType: 'purchase' | 'sales', workspaceId?: string): Order[] => {
  try {
    const storageKey = orderType === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const orders = getFromStorage(storageKey, []);
    
    return orders.filter((order: Order) => 
      order.partyId === partyId &&
      (order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped') &&
      order.workspaceId === workspaceId
    );
  } catch (error) {
    console.error('Error getting pending orders:', error);
    return [];
  }
};

/**
 * Get order details by ID
 */
export const getOrderById = (orderId: string, orderType: 'purchase' | 'sales'): Order | null => {
  try {
    const storageKey = orderType === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const orders = getFromStorage(storageKey, []);
    return orders.find((order: Order) => order.id === orderId) || null;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

/**
 * Complete workflow: Bill creation triggers order update and inventory update
 */
export const processBillWithOrder = (bill: Bill, orderId: string, orderType: 'purchase' | 'sales', workspaceId?: string): boolean => {
  try {
    // Step 1: Update order status
    const orderUpdated = updateOrderOnBillCreation(orderId, orderType);
    
    if (!orderUpdated) {
      console.error('Failed to update order status');
      return false;
    }
    
    // Step 2: Update inventory based on order type
    let inventoryUpdated = true;
    if (orderType === 'purchase') {
      inventoryUpdated = updateInventoryFromPurchaseOrder(orderId, workspaceId);
    } else if (orderType === 'sales') {
      inventoryUpdated = updateInventoryFromSalesOrder(orderId, workspaceId);
    }
    
    if (!inventoryUpdated) {
      console.warn('Inventory update failed, but order status was updated');
    }
    
    return true;
  } catch (error) {
    console.error('Error processing bill with order:', error);
    return false;
  }
};

/**
 * Check if order has associated bill
 */
export const getOrderBill = (orderId: string, workspaceId?: string): Bill | null => {
  try {
    const bills = getFromStorage('bills', []);
    return bills.find((bill: Bill) => 
      bill.orderId === orderId && 
      bill.workspaceId === workspaceId
    ) || null;
  } catch (error) {
    console.error('Error getting order bill:', error);
    return null;
  }
};

/**
 * Get order status badge configuration
 */
export const getOrderStatusConfig = (status: string, hasLinkedBill: boolean) => {
  const configs = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Pending', icon: '⏱️' },
    confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Confirmed', icon: '✅' },
    shipped: { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Shipped', icon: '🚚' },
    delivered: { color: 'bg-green-100 text-green-700 border-green-300', label: hasLinkedBill ? 'Delivered (Billed)' : 'Delivered', icon: '📦' },
    received: { color: 'bg-green-100 text-green-700 border-green-300', label: hasLinkedBill ? 'Received (Billed)' : 'Received', icon: '📦' },
    cancelled: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Cancelled', icon: '❌' },
  };
  
  return configs[status as keyof typeof configs] || configs.pending;
};

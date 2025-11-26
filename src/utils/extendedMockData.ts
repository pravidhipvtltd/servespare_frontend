import { Customer, Vendor, Bill, Order, BankAccount, CashTransaction, Banner } from '../types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    address: '123 MG Road, Bangalore',
    vehicleType: 'four_wheeler',
    vehicleNumber: 'KA-01-AB-1234',
    workspaceId: 'ws1',
    createdAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'cust2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 87654 32109',
    address: '456 Park Street, Mumbai',
    vehicleType: 'two_wheeler',
    vehicleNumber: 'MH-02-CD-5678',
    workspaceId: 'ws1',
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'cust3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 76543 21098',
    address: '789 Ring Road, Delhi',
    vehicleType: 'four_wheeler',
    vehicleNumber: 'DL-03-EF-9012',
    workspaceId: 'ws1',
    createdAt: '2024-11-01T00:00:00Z',
  },
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vend1',
    name: 'Suresh Traders',
    company: 'Suresh Auto Parts Ltd',
    email: 'suresh@traders.com',
    phone: '+91 99888 77766',
    address: 'Industrial Area, Pune',
    category: 'branded',
    workspaceId: 'ws1',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'vend2',
    name: 'Local Parts Co',
    company: 'Local Parts Co',
    email: 'info@localparts.com',
    phone: '+91 88777 66655',
    address: 'Market Road, Chennai',
    category: 'local',
    workspaceId: 'ws1',
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'vend3',
    name: 'Premium Auto Supplies',
    company: 'Premium Auto Supplies Pvt Ltd',
    email: 'sales@premiumauto.com',
    phone: '+91 77666 55544',
    address: 'Highway Complex, Hyderabad',
    category: 'branded',
    workspaceId: 'ws1',
    createdAt: '2024-03-20T00:00:00Z',
  },
];

export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill1',
    billNumber: 'INV-2024-001',
    customerId: 'cust1',
    customerName: 'Rajesh Kumar',
    items: [
      { itemId: 'inv1', itemName: 'Engine Oil - Castrol 20W-50', quantity: 2, price: 850, total: 1700 },
      { itemId: 'inv4', itemName: 'Spark Plug - NGK', quantity: 4, price: 180, total: 720 },
    ],
    subtotal: 2420,
    tax: 436,
    discount: 50,
    total: 2806,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    workspaceId: 'ws1',
    createdBy: '3',
    createdAt: '2024-11-24T10:30:00Z',
  },
  {
    id: 'bill2',
    billNumber: 'INV-2024-002',
    customerId: 'cust2',
    customerName: 'Priya Sharma',
    items: [
      { itemId: 'inv5', itemName: 'Battery - Exide', quantity: 1, price: 4500, total: 4500 },
    ],
    subtotal: 4500,
    tax: 810,
    discount: 100,
    total: 5210,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    workspaceId: 'ws1',
    createdBy: '3',
    createdAt: '2024-11-24T11:15:00Z',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    orderNumber: 'PO-2024-001',
    vendorId: 'vend1',
    vendorName: 'Suresh Traders',
    items: [
      { itemName: 'Engine Oil - Castrol 20W-50', quantity: 50, price: 750, total: 37500 },
      { itemName: 'Air Filter - Bosch', quantity: 30, price: 1100, total: 33000 },
    ],
    total: 70500,
    status: 'received',
    expectedDate: '2024-11-20T00:00:00Z',
    receivedDate: '2024-11-19T00:00:00Z',
    workspaceId: 'ws1',
    createdAt: '2024-11-10T00:00:00Z',
  },
  {
    id: 'ord2',
    orderNumber: 'PO-2024-002',
    vendorId: 'vend2',
    vendorName: 'Local Parts Co',
    items: [
      { itemName: 'Brake Pads - Local', quantity: 100, price: 300, total: 30000 },
    ],
    total: 30000,
    status: 'pending',
    expectedDate: '2024-11-30T00:00:00Z',
    workspaceId: 'ws1',
    createdAt: '2024-11-22T00:00:00Z',
  },
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank1',
    bankName: 'HDFC Bank',
    accountNumber: '1234567890',
    accountHolder: 'AutoParts Pro',
    balance: 250000,
    workspaceId: 'ws1',
  },
  {
    id: 'bank2',
    bankName: 'ICICI Bank',
    accountNumber: '0987654321',
    accountHolder: 'AutoParts Pro',
    balance: 180000,
    workspaceId: 'ws1',
  },
];

export const MOCK_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'cash1',
    type: 'in',
    amount: 5210,
    description: 'Payment from Priya Sharma',
    category: 'Sales',
    workspaceId: 'ws1',
    createdAt: '2024-11-24T11:15:00Z',
  },
  {
    id: 'cash2',
    type: 'out',
    amount: 2000,
    description: 'Office supplies',
    category: 'Expenses',
    workspaceId: 'ws1',
    createdAt: '2024-11-24T09:00:00Z',
  },
];

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'ban1',
    title: 'Winter Sale - 20% Off',
    description: 'Get 20% off on all branded parts this winter season',
    isActive: true,
    workspaceId: 'ws1',
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'ban2',
    title: 'Free Service Check',
    description: 'Free vehicle inspection with any purchase above ₹5000',
    isActive: true,
    workspaceId: 'ws1',
    createdAt: '2024-11-15T00:00:00Z',
  },
];

export const initializeExtendedStorage = () => {
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify(MOCK_CUSTOMERS));
  }
  if (!localStorage.getItem('vendors')) {
    localStorage.setItem('vendors', JSON.stringify(MOCK_VENDORS));
  }
  if (!localStorage.getItem('bills')) {
    localStorage.setItem('bills', JSON.stringify(MOCK_BILLS));
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(MOCK_ORDERS));
  }
  if (!localStorage.getItem('bankAccounts')) {
    localStorage.setItem('bankAccounts', JSON.stringify(MOCK_BANK_ACCOUNTS));
  }
  if (!localStorage.getItem('cashTransactions')) {
    localStorage.setItem('cashTransactions', JSON.stringify(MOCK_CASH_TRANSACTIONS));
  }
  if (!localStorage.getItem('banners')) {
    localStorage.setItem('banners', JSON.stringify(MOCK_BANNERS));
  }
};
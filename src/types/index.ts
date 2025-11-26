export type UserRole = 'super_admin' | 'admin' | 'inventory_manager' | 'cashier' | 'finance';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
  isActive?: boolean;
  avatar?: string;
  permissions?: any;
}

export interface Workspace {
  id: string;
  name: string;
  adminId: string;
  createdAt: string;
}

export type PartyType = 'customer' | 'supplier' | 'distributor' | 'manufacturer' | 'wholesaler';
export type PaymentTerms = 'cash' | 'credit_7' | 'credit_15' | 'credit_30' | 'credit_45';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  gstNumber?: string;
  panNumber?: string;
  paymentTerms: PaymentTerms;
  creditLimit?: number;
  openingBalance: number;
  currentBalance: number;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
  logo?: string;
}

export interface PartyTransaction {
  id: string;
  partyId: string;
  type: 'purchase' | 'payment' | 'return';
  amount: number;
  description: string;
  invoiceNumber?: string;
  date: string;
  workspaceId?: string;
  createdBy?: string;
}

export type VehicleType = 'two_wheeler' | 'four_wheeler';
export type ItemCategory = 'local' | 'original';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  vehicleType: VehicleType;
  bikeName?: string;
  bikeModel?: string;
  bikeType?: string;
  quantity: number;
  minStockLevel: number;
  price: number;
  mrp: number;
  retailPrice?: number;
  wholesalePrice?: number;
  distributorPrice?: number;
  partyId?: string; // Link to supplier
  partNumber?: string;
  barcode?: string;
  hsnCode?: string;
  location?: string;
  warrantyPeriod?: string; // Warranty in months
  image?: string;
  workspaceId?: string;
  createdAt: string;
  lastRestocked?: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  price: number;
  customerName?: string;
  notes?: string;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  orderId?: string; // Link to order for automatic updates
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerPanVat?: string;
  customerType?: 'customer' | PartyType; // Type of customer
  partyId?: string; // Link to party if exists
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  total: number;
  paymentMethod: 'cash' | 'esewa' | 'fonepay' | 'bank' | 'credit' | 'cheque';
  paymentStatus: 'paid' | 'pending' | 'draft';
  notes?: string;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface BillItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  partyId?: string;
  items: OrderItem[];
  status: 'pending' | 'received' | 'cancelled';
  expectedDate?: string;
  workspaceId?: string;
  createdAt: string;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  receivedQuantity?: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  state: string;
  pincode: string;
  items: CustomerOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cod' | 'paid' | 'credit';
  workspaceId?: string;
  createdAt: string;
  completedAt?: string;
  createdBy?: string;
}

export interface CustomerOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Return {
  id: string;
  returnNumber: string;
  billId?: string;
  customerName: string;
  items: ReturnItem[];
  reason: string;
  refundAmount: number;
  workspaceId?: string;
  createdAt: string;
}

export interface ReturnItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  ifscCode: string;
  balance: number;
  workspaceId?: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  category: string;
  workspaceId?: string;
  createdAt: string;
}
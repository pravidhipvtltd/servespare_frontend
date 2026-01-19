export type UserRole =
  | "super_admin"
  | "admin"
  | "inventory_manager"
  | "cashier"
  | "customer";

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
  businessName?: string; // For admin users created by SuperAdmin
  branch?: string; // Branch/location assignment
  branchId?: string; // Branch ID for direct reference
}

export interface Workspace {
  id: string;
  name: string;
  adminId?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
}

// Branch Management
export interface Branch {
  id: string;
  name: string;
  code: string; // Short code for the branch (e.g., "MAIN", "KTM01")
  address: string;
  city: string;
  state?: string;
  phone: string;
  email?: string;
  manager?: string; // User ID of branch manager
  managerName?: string;
  isActive: boolean;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

export type PartyType = "supplier" | "customer";
export type CustomerType =
  | "retail"
  | "retailer"
  | "workshop"
  | "distributor"
  | "wholesaler";
export type PaymentTerms =
  | "cash"
  | "credit_7"
  | "credit_15"
  | "credit_30"
  | "credit_45";

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  customerType?: CustomerType; // Only used when type is 'customer'
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
  type: "purchase" | "payment" | "return";
  amount: number;
  description: string;
  invoiceNumber?: string;
  date: string;
  workspaceId?: string;
  createdBy?: string;
}

export type PurchaseOrderStatus = "draft" | "ordered" | "received" | "billed";

export interface PurchaseOrderItem {
  id: string;
  inventoryItemId?: string;
  itemName: string;
  partNumber?: string;
  description?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  taxPercent: number;
  discount: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  invoiceFile?: string; // Base64 PDF
  invoiceFileName?: string;
  grnGenerated: boolean;
  grnNumber?: string;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
}

export interface GRN {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  items: PurchaseOrderItem[];
  notes?: string;
  workspaceId?: string;
  createdAt: string;
}

export interface CashDrawerShift {
  id: string;
  cashierId: string;
  cashierName: string;
  branchId?: string;
  branchName?: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  actualAmount?: number;
  difference?: number; // Positive = surplus, Negative = loss
  status: "open" | "closed" | "force_closed";
  transactions: CashTransaction[];
  notes?: string;
  varianceReason?: string; // Reason for cash variance (surplus/shortage)
  flagged?: boolean;
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  workspaceId?: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  type: "sale" | "refund" | "cash_in" | "cash_out" | "opening" | "closing";
  amount: number;
  billNumber?: string;
  description?: string;
  timestamp: string;
}

export type VehicleType = "two_wheeler" | "four_wheeler";
export type ItemCategory = "local" | "original";

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
  partyName?: string;
  partNumber?: string;
  barcode?: string;
  hsnCode?: string;
  location?: string;
  warrantyPeriod?: string; // Warranty in months
  image?: string;
  workspaceId?: string;
  branchId?: number; // Branch ID (from backend)
  createdAt: string;
  lastRestocked?: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: "in" | "out";
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
  customerType?: "customer" | PartyType; // Type of customer
  partyId?: string; // Link to party if exists
  customerId?: string; // Same as partyId, for ledger compatibility
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType?: "percentage" | "fixed";
  discountHistory?: DiscountHistoryEntry[]; // Track all discounts applied
  total: number;
  paymentMethod: "cash" | "esewa" | "fonepay" | "bank" | "credit" | "cheque";
  bankAccountId?: string; // ID of the bank account/payment method used
  paymentStatus:
    | "paid"
    | "pending"
    | "draft"
    | "hold"
    | "cancelled"
    | "refunded"
    | "credit";
  notes?: string;
  branchId?: string; // Branch where sale was made
  branchName?: string;
  cashierName?: string; // Name of cashier who created the bill
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface DiscountHistoryEntry {
  id: string;
  amount: number;
  type: "percentage" | "fixed";
  appliedBy: string;
  appliedAt: string;
  reason?: string;
}

export interface BillItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  warranty?: string; // e.g., '1 Year', '6 Months', 'No Warranty'
}

export interface Order {
  id: string;
  orderNumber: string;
  partyId?: string;
  items: OrderItem[];
  status: "pending" | "received" | "cancelled";
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
  status: "pending" | "completed" | "cancelled";
  paymentMethod: "cod" | "paid" | "credit";
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

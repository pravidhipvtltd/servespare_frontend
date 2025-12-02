# 📊 Complete Ledger System - Data Sync Guide

## 🎯 System Overview

The Ledger System automatically syncs supplier and customer data from **Total Inventory**, **Purchase Orders**, **Sales Orders**, and **Bills** to provide comprehensive financial tracking.

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PARTIES (Suppliers & Customers)                         │
│     • Supplier/Customer basic info                          │
│     • Contact details (email, phone, address)               │
│     • Type: 'supplier' or 'customer'                        │
│                                                              │
│  2. TOTAL INVENTORY                                          │
│     • Each item linked to supplier via partyId              │
│     • Item quantity & price                                 │
│     • Total value = price × quantity                        │
│                                                              │
│  3. PURCHASE ORDERS                                          │
│     • Orders placed to suppliers                            │
│     • Items, quantities, prices, totals                     │
│     • Linked to supplier via partyId                        │
│                                                              │
│  4. SALES ORDERS                                             │
│     • Orders from customers                                 │
│     • Items, quantities, prices, totals                     │
│     • Linked to customer via customerId                     │
│                                                              │
│  5. BILLS                                                    │
│     • Sales bills to customers                              │
│     • Purchase payments                                     │
│     • Returns (marked with 'RET' in billNumber)            │
│     • Payment status tracking                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LEDGER SYSTEM                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📘 PURCHASE LEDGER (Supplier Tracking)                     │
│     ✅ Syncs from:                                          │
│        • Total Inventory (supplier items)                   │
│        • Purchase Orders                                    │
│        • Payment Bills                                      │
│        • Return Bills                                       │
│                                                              │
│  📗 SALES LEDGER (Customer Tracking)                        │
│     ✅ Syncs from:                                          │
│        • Sales Orders                                       │
│        • Sales Bills                                        │
│        • Walk-in Customer Bills                             │
│        • Return Bills                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Purchase Ledger - Complete Example

### **Scenario: Supplier "ABC Auto Parts"**

#### **1. Supplier Added in Parties**
```javascript
{
  id: "sup_001",
  name: "ABC Auto Parts",
  type: "supplier",
  email: "abc@autoparts.com",
  phone: "+977 9841234567",
  address: "Thamel, Kathmandu",
  workspaceId: "ws1"
}
```

#### **2. Inventory Items from This Supplier**
Added in **Total Inventory Panel**:

```javascript
// Item 1: Engine Oil
{
  id: "inv_001",
  name: "Engine Oil - Castrol 20W-50",
  partyId: "sup_001",  // ← Linked to ABC Auto Parts
  quantity: 50,
  price: 1200,
  workspaceId: "ws1"
}
// Value: 50 × रू1,200 = रू60,000

// Item 2: Brake Pads
{
  id: "inv_002",
  name: "Brake Pads Set",
  partyId: "sup_001",  // ← Linked to ABC Auto Parts
  quantity: 30,
  price: 2500,
  workspaceId: "ws1"
}
// Value: 30 × रू2,500 = रू75,000

// Item 3: Air Filter
{
  id: "inv_003",
  name: "Air Filter Premium",
  partyId: "sup_001",  // ← Linked to ABC Auto Parts
  quantity: 40,
  price: 850,
  workspaceId: "ws1"
}
// Value: 40 × रू850 = रू34,000
```

**Total Inventory Value from ABC Auto Parts:**
```
रू60,000 + रू75,000 + रू34,000 = रू169,000
Total Items: 50 + 30 + 40 = 120 items
```

#### **3. Purchase Orders from This Supplier**
```javascript
// Purchase Order 1
{
  id: "po_001",
  orderNumber: "PO-001234",
  partyId: "sup_001",  // ← ABC Auto Parts
  items: [
    { name: "Spark Plugs", quantity: 20, price: 180, total: 3600 }
  ],
  total: 3600,
  status: "delivered",
  createdAt: "2024-12-01T10:00:00Z"
}

// Purchase Order 2
{
  id: "po_002",
  orderNumber: "PO-001235",
  partyId: "sup_001",  // ← ABC Auto Parts
  items: [
    { name: "Oil Filter", quantity: 15, price: 380, total: 5700 }
  ],
  total: 5700,
  status: "delivered",
  createdAt: "2024-12-02T14:00:00Z"
}
```

**Total Purchase Orders:**
```
रू3,600 + रू5,700 = रू9,300
```

#### **4. Payments Made**
```javascript
{
  id: "bill_001",
  billNumber: "PAY-001",
  customerId: "sup_001",  // ← Payment to ABC Auto Parts
  total: 50000,
  paymentStatus: "paid",
  paymentMethod: "bank_transfer",
  createdAt: "2024-12-03T09:00:00Z"
}
```

#### **5. Returns to Supplier**
```javascript
{
  id: "bill_002",
  billNumber: "RET-001",  // ← 'RET' indicates return
  customerId: "sup_001",  // ← Return to ABC Auto Parts
  items: [
    { name: "Defective Oil Filter", quantity: 2, price: 380, total: 760 }
  ],
  total: 760,
  createdAt: "2024-12-04T11:00:00Z"
}
```

---

### **📊 Final Purchase Ledger Summary for ABC Auto Parts**

```
┌──────────────────────────────────────────────────────┐
│  PURCHASE LEDGER - ABC Auto Parts                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│  📦 Items Purchased:     155 items                   │
│     • From Inventory:    120 items (रू169,000)       │
│     • From PO-001234:    20 items (रू3,600)          │
│     • From PO-001235:    15 items (रू5,700)          │
│                                                       │
│  🔄 Items Returned:      2 items (रू760)             │
│                                                       │
│  💰 Financial Summary:                               │
│     • Gross Amount:      रू178,300                   │
│     • Return Amount:     रू760                       │
│     • Net Amount:        रू177,540                   │
│     • Paid Amount:       रू50,000                    │
│     • Due Remaining:     रू127,540 ⚠️                │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

### **📋 Detailed Transaction History**

When you click **"View Details"** for ABC Auto Parts:

```
┌─────┬─────────────┬──────────────────────────┬────────────┬───────────┬────────────┬─────────────┐
│ S.N │    Date     │         Subject          │  Credited  │  Debited  │ Net Amount │   Balance   │
├─────┼─────────────┼──────────────────────────┼────────────┼───────────┼────────────┼─────────────┤
│  1  │ 2024-12-01  │ Purchase Bill #PO-001234 │     -      │ रू3,600   │ रू3,600    │ रू3,600     │
│  2  │ 2024-12-02  │ Purchase Bill #PO-001235 │     -      │ रू5,700   │ रू5,700    │ रू9,300     │
│  3  │ 2024-12-03  │ Payment Bill #PAY-001    │ रू50,000   │     -     │ -रू50,000  │ -रू40,700   │
│  4  │ 2024-12-04  │ Product Return #RET-001  │ रू760      │     -     │ -रू760     │ -रू41,460   │
└─────┴─────────────┴──────────────────────────┴────────────┴───────────┴────────────┴─────────────┘

Note: Inventory items (रू169,000) are included in Gross Amount but not shown as individual 
transactions since they're bulk stock entries.

Final Balance: -रू41,460 (Negative means we PAID MORE than we OWE - supplier owes us!)
```

---

## 💡 Sales Ledger - Complete Example

### **Scenario: Customer "Ramesh Thapa"**

#### **1. Customer Added in Parties**
```javascript
{
  id: "cust_001",
  name: "Ramesh Thapa",
  type: "customer",
  email: "ramesh@example.com",
  phone: "+977 9841234567",
  address: "Thamel, Kathmandu",
  workspaceId: "ws1"
}
```

#### **2. Sales Orders**
```javascript
// Sales Order 1
{
  id: "so_001",
  orderNumber: "SO-001234",
  customerId: "cust_001",  // ← Ramesh Thapa
  items: [
    { name: "Engine Oil", quantity: 2, price: 1200, total: 2400 },
    { name: "Air Filter", quantity: 1, price: 850, total: 850 }
  ],
  total: 3250,
  status: "delivered",
  createdAt: "2024-11-28T10:00:00Z"
}
```

#### **3. Sales Bills (Walk-in Purchase)**
```javascript
{
  id: "bill_001",
  billNumber: "INV-2024-001",
  customerId: "cust_001",  // ← Ramesh Thapa
  items: [
    { name: "Brake Pads", quantity: 1, price: 2500, total: 2500 }
  ],
  total: 2500,
  paymentStatus: "paid",
  createdAt: "2024-11-29T14:00:00Z"
}
```

#### **4. Customer Returns**
```javascript
{
  id: "bill_002",
  billNumber: "RET-002",  // ← Return from customer
  customerId: "cust_001",  // ← Ramesh Thapa
  items: [
    { name: "Wrong Air Filter", quantity: 1, price: 850, total: 850 }
  ],
  total: 850,
  createdAt: "2024-11-30T09:00:00Z"
}
```

---

### **📊 Final Sales Ledger Summary for Ramesh Thapa**

```
┌──────────────────────────────────────────────────────┐
│  SALES LEDGER - Ramesh Thapa                         │
├──────────────────────────────────────────────────────┤
│                                                       │
│  🛒 Items Purchased:     4 items                     │
│     • From SO-001234:    3 items (रू3,250)           │
│     • From INV-2024-001: 1 item (रू2,500)            │
│                                                       │
│  🔄 Items Returned:      1 item (रू850)              │
│                                                       │
│  💰 Financial Summary:                               │
│     • Gross Amount:      रू5,750                     │
│     • Return Amount:     रू850                       │
│     • Net Amount:        रू4,900                     │
│     • Paid Amount:       रू2,500                     │
│     • Due Remaining:     रू2,400 ⚠️                  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

### **📋 Detailed Transaction History**

```
┌─────┬─────────────┬──────────────────────────┬────────────┬───────────┬────────────┬─────────────┐
│ S.N │    Date     │         Subject          │  Credited  │  Debited  │ Net Amount │   Balance   │
├─────┼─────────────┼──────────────────────────┼────────────┼───────────┼────────────┼─────────────┤
│  1  │ 2024-11-28  │ Sales Order #SO-001234   │     -      │ रू3,250   │ रू3,250    │ रू3,250     │
│  2  │ 2024-11-29  │ Sales Bill #INV-2024-001 │     -      │ रू2,500   │ रू2,500    │ रू5,750     │
│  3  │ 2024-11-30  │ Product Return #RET-002  │ रू850      │     -     │ -रू850     │ रू4,900     │
└─────┴─────────────┴──────────────────────────┴────────────┴───────────┴────────────┴─────────────┘

Final Balance: रू4,900 (Positive means customer still owes us रू2,400)
```

---

## 🔧 How Data Syncs Automatically

### **1. When Adding Inventory Item in Total Inventory:**
```javascript
// Admin adds item with supplier selected
const newItem = {
  name: "Engine Oil",
  partyId: "sup_001",  // ← Supplier selected from dropdown
  quantity: 50,
  price: 1200,
  // ... other fields
}
```
**Result:** Purchase Ledger automatically includes this:
- Items Purchased: +50
- Gross Amount: +(50 × रू1,200) = +रू60,000

### **2. When Creating Purchase Order:**
```javascript
const purchaseOrder = {
  partyId: "sup_001",  // ← Supplier link
  items: [...],
  total: 5000
}
```
**Result:** Purchase Ledger updates:
- Items Purchased: +items count
- Gross Amount: +रू5,000

### **3. When Customer Places Order (Sales Order):**
```javascript
const salesOrder = {
  customerId: "cust_001",  // ← Customer link
  items: [...],
  total: 3000
}
```
**Result:** Sales Ledger updates:
- Items Purchased: +items count
- Gross Amount: +रू3,000

### **4. When Processing Return:**
```javascript
const returnBill = {
  billNumber: "RET-001",  // ← Contains 'RET'
  customerId: "party_id",
  total: 500
}
```
**Result:** Ledger updates:
- Items Returned: +items count
- Return Amount: +रू500
- Net Amount: Gross - Returns

---

## 📊 Key Metrics Explained

### **Items Purchased**
- For Suppliers: All inventory items + purchase order items
- For Customers: All sales order items + sales bill items

### **Gross Amount**
```
Purchase Ledger = Σ(Inventory Value) + Σ(Purchase Orders)
Sales Ledger = Σ(Sales Orders) + Σ(Sales Bills)
```

### **Net Amount**
```
Net Amount = Gross Amount - Return Amount
```

### **Due Remaining**
```
Due Remaining = Net Amount - Paid Amount
```

---

## ✅ Complete Implementation Features

### **✨ Purchase Ledger Tracking:**
1. ✅ All supplier data from Parties
2. ✅ Inventory items linked to suppliers (via partyId)
3. ✅ Purchase orders to suppliers
4. ✅ Payments made to suppliers
5. ✅ Returns to suppliers
6. ✅ Running balance calculation

### **✨ Sales Ledger Tracking:**
1. ✅ All customer data from Parties
2. ✅ Sales orders from customers
3. ✅ Walk-in customer bills
4. ✅ Payments received from customers
5. ✅ Returns from customers
6. ✅ Running balance calculation

### **✨ UI Features:**
1. ✅ Two-tab interface (Purchase/Sales)
2. ✅ Summary stats dashboard (5 cards)
3. ✅ Searchable supplier/customer list
4. ✅ Color-coded badges for items
5. ✅ Detailed transaction view per party
6. ✅ Date range filtering
7. ✅ Running balance display
8. ✅ Final balance calculation
9. ✅ Nepal localization (रू currency)

---

## 🎯 Testing the System

### **Step 1: Add Suppliers in Parties**
1. Go to **Parties** panel
2. Add suppliers with type = "supplier"

### **Step 2: Add Inventory Items**
1. Go to **Total Inventory**
2. Add items and select supplier from dropdown
3. **partyId** automatically links item to supplier

### **Step 3: View Purchase Ledger**
1. Go to **Ledger** panel
2. Click **Purchase Ledger** tab
3. See all suppliers with their inventory totals
4. Click **"View Details"** to see transactions

### **Step 4: Test Sales Ledger**
1. Add customers in **Parties** (type = "customer")
2. Create sales orders or bills
3. Go to **Ledger** > **Sales Ledger** tab
4. View customer transactions

---

## 🚀 Result

**Complete financial tracking system with:**
- ✅ Automatic data synchronization
- ✅ Real-time balance calculations
- ✅ Comprehensive transaction history
- ✅ Supplier and customer tracking
- ✅ Inventory integration
- ✅ Multi-source data aggregation
- ✅ Professional ledger format
- ✅ Nepal business compliance

---

## 💾 Data Storage Keys

```javascript
localStorage Keys:
- 'parties'          → All suppliers & customers
- 'inventory'        → All inventory items (with partyId)
- 'purchaseOrders'   → Purchase orders to suppliers
- 'salesOrders'      → Sales orders from customers
- 'bills'            → All bills (sales, payments, returns)
```

---

**System Status:** ✅ **FULLY OPERATIONAL**

All data automatically syncs between Total Inventory, Parties, Orders, and Ledger systems!

# 💰 Cashier Dashboard - Complete Features Guide

## 🎉 New Features Added

### 1. ✅ **Cash In & Cash Out** (Header Bar Buttons)
### 2. ✅ **Sales Return System** (Bill ID Lookup)
### 3. ✅ **Return Report Generation**
### 4. ✅ **Recent Returns Dashboard Widget**

---

## 💵 Cash In & Cash Out

### **Location**
Header bar - Top right, next to shift controls

### **Visual Design**
```
[Cash In 💚]  [Cash Out 🔴]  [🟢 Shift Active]  [Transfer]  [End Shift]
```

### **Cash In** 💚

#### **Purpose**
Add cash to the drawer during shift

#### **Common Use Cases**
- ✅ Opening balance adjustment
- ✅ Petty cash replenishment
- ✅ Change brought from bank
- ✅ Correction for previous errors
- ✅ Cash float increase

#### **Process**
1. Click **"Cash In"** button (green)
2. Modal opens
3. Enter **Amount** (NPR)
4. Enter **Reason** (required)
5. Click **"Add Cash"**

#### **Example**
```
Amount: NPR 10,000
Reason: Change brought from bank for customer service
```

#### **What Happens**
- ✅ Transaction recorded in database
- ✅ Amount added to shift total
- ✅ Shows in Cash Drawer panel
- ✅ Updates expected cash calculation
- ✅ Audit trail created

#### **Data Structure**
```typescript
{
  id: "cashin_1701234567890",
  type: "cash_in",
  amount: 10000,
  reason: "Change brought from bank",
  date: "2024-12-01T10:30:00.000Z",
  cashierId: "cashier_1",
  cashierName: "John Doe",
  shiftId: "shift_1701234567890"
}
```

---

### **Cash Out** 🔴

#### **Purpose**
Remove cash from the drawer during shift

#### **Common Use Cases**
- ✅ Bank deposit
- ✅ Petty cash withdrawal
- ✅ Safe deposit
- ✅ Payment to vendors
- ✅ Change given to other cashiers

#### **Process**
1. Click **"Cash Out"** button (red)
2. Modal opens
3. Enter **Amount** (NPR)
4. Enter **Reason** (required)
5. Click **"Remove Cash"**

#### **Example**
```
Amount: NPR 50,000
Reason: Bank deposit - excess cash
```

#### **What Happens**
- ✅ Transaction recorded in database
- ✅ Amount deducted from shift total
- ✅ Shows in Cash Drawer panel
- ✅ Updates expected cash calculation
- ✅ Audit trail created

#### **Data Structure**
```typescript
{
  id: "cashout_1701234567890",
  type: "cash_out",
  amount: 50000,
  reason: "Bank deposit",
  date: "2024-12-01T15:30:00.000Z",
  cashierId: "cashier_1",
  cashierName: "John Doe",
  shiftId: "shift_1701234567890"
}
```

---

### **Expected Cash Calculation** 🧮

**Formula:**
```
Expected Cash = Starting Cash + Cash Sales + Cash In - Cash Out
```

**Example:**
```
Starting Cash:  NPR 5,000
Cash Sales:     NPR 32,500
Cash In:        NPR 10,000
Cash Out:       NPR 50,000
━━━━━━━━━━━━━━━━━━━━━━━━━
Expected Cash:  NPR -2,500 (indicates over-deposit)
```

---

## 🔄 Sales Return System

### **Overview**
Process returns using original Bill ID or Bill Number with full inventory restoration.

### **Menu Item**
**Sales Returns** panel added to sidebar (🔄 icon)

### **Access**
- Dashboard widget: "New Return" button
- Sidebar: Click "Sales Returns"
- Shortcut: From any panel

---

### **Process Return Workflow**

#### **Step 1: Find Bill**

1. Click **"New Return"** or **"Sales Returns"** panel
2. Modal opens with search field
3. Enter **Bill ID** or **Bill Number**
   - Example: `bill_1701234567890`
   - Example: `BIL-1701234567890`
4. Click **"Find"** button

#### **Step 2: Verify Bill**

System displays:
```
┌─────────────────────────────────────┐
│ Bill Number:   BIL-1701234567890    │
│ Date:          Dec 1, 2024 10:30 AM │
│ Customer:      John Doe              │
│ Total Amount:  NPR 15,500            │
└─────────────────────────────────────┘
```

#### **Step 3: Select Items**

- Each item shows:
  - ✅ Item name
  - ✅ Price per unit
  - ✅ Original quantity
  - ✅ Return quantity selector (+/-)

**Example:**
```
🔧 Brake Pad Set
NPR 2,500 each • Original qty: 2
[−] [1] [+]  ← Select quantity to return

⚙️ Oil Filter
NPR 800 each • Original qty: 3
[−] [2] [+]  ← Select quantity to return

💡 Headlight Bulb
NPR 1,200 each • Original qty: 1
[−] [0] [+]  ← Not returning this item
```

#### **Step 4: Enter Reason**

Required field - common reasons:
- ✅ Defective product
- ✅ Wrong item ordered
- ✅ Customer changed mind
- ✅ Incompatible with vehicle
- ✅ Better price elsewhere
- ✅ Damaged during installation

#### **Step 5: Process Return**

Click **"Process Return"** button

**What Happens:**
1. ✅ Validates all data
2. ✅ Creates return record
3. ✅ Updates original bill status to "returned"
4. ✅ Restores inventory quantities
5. ✅ Adjusts shift sales
6. ✅ Prints return receipt
7. ✅ Shows success message

---

### **Return Receipt** 🧾

**Automated Print:**

```
┌─────────────────────────────────────┐
│          Serve Spares               │
│      *** SALES RETURN ***           │
│                                      │
│ Original Bill: BIL-1701234567890    │
│ Return Date: Dec 1, 2024 3:45 PM    │
│                                      │
│ Returned By: John Doe (Cashier)     │
│ Reason: Defective product           │
│                                      │
├─────────────────────────────────────┤
│ Returned Items:                      │
│                                      │
│ Brake Pad Set x1        NPR 2,500   │
│ Oil Filter x2           NPR 1,600   │
│                                      │
│ Subtotal:               NPR 4,100   │
│ Discount:              -NPR   164   │
│ Tax (13%):              NPR   512   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ REFUND TOTAL:           NPR 4,448   │
│                                      │
├─────────────────────────────────────┤
│         *** RETURNED ***             │
│                                      │
│ Please keep this receipt             │
│ Refund processed on Dec 1, 2024     │
└─────────────────────────────────────┘
```

---

### **Return Data Structure**

```typescript
interface SalesReturn {
  id: string;                    // return_1701234567890
  billId: string;                // Original bill ID
  billNumber: string;            // Original bill number
  returnDate: string;            // ISO timestamp
  items: BillItem[];             // Returned items
  subtotal: number;              // Return subtotal
  discount: number;              // Prorated discount
  tax: number;                   // Calculated tax
  total: number;                 // Total refund amount
  reason: string;                // Return reason
  returnedBy: string;            // Cashier name
  cashierId: string;             // Cashier ID
  workspaceId: string;           // Workspace ID
  originalBill?: Bill;           // Reference to original
}
```

**Storage:**
```
localStorage.setItem('sales_returns', JSON.stringify(returns));
```

---

## 📊 Recent Returns Dashboard Widget

### **Location**
Dashboard panel - Below sales graph

### **Display**
Shows today's returns only

**Example:**
```
┌──────────────────────────────────────────────┐
│ 🔄 Recent Returns Today (3)                  │
├──────────────────────────────────────────────┤
│ ❌ BIL-1701234567890                         │
│    Defective product                          │
│    -NPR 4,448 • 3:45 PM                      │
├──────────────────────────────────────────────┤
│ ❌ BIL-1701234567891                         │
│    Wrong item ordered                         │
│    -NPR 2,300 • 2:15 PM                      │
├──────────────────────────────────────────────┤
│ ❌ BIL-1701234567892                         │
│    Customer changed mind                      │
│    -NPR 8,750 • 11:30 AM                     │
└──────────────────────────────────────────────┘
```

### **Features**
- ✅ Shows up to 5 most recent returns
- ✅ Red background (visual alert)
- ✅ Bill number
- ✅ Return reason
- ✅ Refund amount (negative)
- ✅ Time of return
- ✅ Click to view details

---

## 📈 Return Reports

### **Access**
**Sales Returns** panel → **"Generate Report"** button

### **Report Contents**

#### **1. Header Section**
```
═══════════════════════════════════════════════
          Serve Spares - Auto Parts
           Sales Return Report
═══════════════════════════════════════════════
Generated: December 1, 2024 5:30 PM
Period: Today / Week / Month / All
```

#### **2. Summary Section**
```
┌─────────────────────────────────────────────┐
│ Summary                                      │
├─────────────────────────────────────────────┤
│ Total Returns:        15                     │
│ Total Amount:         NPR 45,230             │
│ Report Date:          December 1, 2024       │
└─────────────────────────────────────────────┘
```

#### **3. Detailed Table**
```
┌────────────────┬──────────────┬───────┬────────────────┬──────────┐
│ Date & Time    │ Bill Number  │ Items │ Reason         │ Amount   │
├────────────────┼──────────────┼───────┼────────────────┼──────────┤
│ Dec 1, 3:45 PM │ BIL-17012345 │ 2     │ Defective      │ 4,448    │
│ Dec 1, 2:15 PM │ BIL-17012346 │ 1     │ Wrong item     │ 2,300    │
│ Dec 1, 11:30AM │ BIL-17012347 │ 3     │ Changed mind   │ 8,750    │
├────────────────┴──────────────┴───────┴────────────────┼──────────┤
│                              TOTAL RETURNS:              │ 45,230   │
└──────────────────────────────────────────────────────────┴──────────┘
```

#### **4. Action Button**
```
[ Print Report ]
```

### **Report Filters**
- **Today**: Current day returns
- **Week**: Last 7 days
- **Month**: Current month
- **All**: All time returns

### **Print Options**
- ✅ Direct browser print
- ✅ Save as PDF
- ✅ Professional formatting
- ✅ Company branding

---

## 💾 Data Storage

### **LocalStorage Keys**

#### **1. Sales Returns**
```javascript
localStorage.setItem('sales_returns', JSON.stringify([
  {
    id: "return_1701234567890",
    billId: "bill_1701234567890",
    billNumber: "BIL-1701234567890",
    returnDate: "2024-12-01T15:45:00.000Z",
    items: [...],
    total: 4448,
    reason: "Defective product",
    // ... other fields
  }
]));
```

#### **2. Cash Transactions**
```javascript
localStorage.setItem('cash_in_out_transactions', JSON.stringify([
  {
    id: "cashin_1701234567890",
    type: "cash_in",
    amount: 10000,
    reason: "Change from bank",
    date: "2024-12-01T10:30:00.000Z",
    // ... other fields
  }
]));
```

#### **3. Updated Shift Data**
```javascript
localStorage.setItem('cashier_shifts', JSON.stringify([
  {
    id: "shift_1701234567890",
    startCash: 5000,
    totalSales: 32500,
    cashIn: 10000,
    cashOut: 50000,
    // ... other fields
  }
]));
```

---

## 📊 Dashboard Metrics Update

### **New Metric: Total Returns**

```
┌────────────────────────────────┐
│ 🔄 Total Returns               │
│                                 │
│ NPR 12,750                      │
│ 5 returns today                 │
└────────────────────────────────┘
```

**Calculation:**
```javascript
const totalReturnsAmount = salesReturns
  .filter(r => new Date(r.returnDate).toDateString() === today)
  .reduce((sum, r) => sum + r.total, 0);

const totalReturnsCount = salesReturns
  .filter(r => new Date(r.returnDate).toDateString() === today)
  .length;
```

---

## 🔄 Inventory Restoration

### **Automatic Process**

When return is processed:

1. **Identify Returned Items**
```javascript
const returnedItems = [
  { itemId: "item_1", quantity: 1 },
  { itemId: "item_2", quantity: 2 }
];
```

2. **Update Inventory**
```javascript
const updatedInventory = inventory.map(item => {
  const returnedItem = returnedItems.find(ri => ri.itemId === item.id);
  if (returnedItem) {
    return {
      ...item,
      quantity: item.quantity + returnedItem.quantity
    };
  }
  return item;
});
```

3. **Save to Storage**
```javascript
saveToStorage('inventory', updatedInventory);
```

**Example:**
```
Before Return:
  Brake Pad Set: 5 units

After Return (1 unit):
  Brake Pad Set: 6 units  ✅
```

---

## 🧾 Sales Return Panel

### **Features**

#### **1. Search & Filter**
```
[Search: Bill number or reason...]  [Today] [Week] [Month] [All]
```

#### **2. Returns List**
Table with columns:
- Date & Time
- Bill Number
- Items (count)
- Reason
- Returned By (cashier name)
- Amount (negative, red)

#### **3. Actions**
- **New Return**: Opens return modal
- **Generate Report**: Creates printable report
- **View Details**: (Future) Full return details

#### **4. Summary Stats**
```
15 returns • NPR 45,230
```

---

## 🎯 Use Cases

### **Scenario 1: Customer Returns Defective Product**

**Time:** 3:45 PM

**Steps:**
1. Customer brings defective brake pads with receipt
2. Cashier clicks **"New Return"**
3. Enters **BIL-1701234567890**
4. Clicks **"Find"**
5. Bill details appear
6. Selects **Brake Pad Set × 1** for return
7. Enters reason: **"Defective product"**
8. Clicks **"Process Return"**
9. Receipt prints automatically
10. Inventory updated: +1 Brake Pad Set
11. Customer receives refund: NPR 2,500

**Result:** ✅ Complete audit trail, inventory restored, customer satisfied

---

### **Scenario 2: Bank Deposit During Shift**

**Time:** 3:00 PM

**Steps:**
1. Cash drawer has NPR 75,000
2. Cashier clicks **"Cash Out"**
3. Enters amount: **NPR 50,000**
4. Enters reason: **"Bank deposit - excess cash"**
5. Clicks **"Remove Cash"**
6. Transaction recorded
7. Expected cash updated: 75,000 - 50,000 = 25,000

**Result:** ✅ Proper documentation, accurate end-of-shift reconciliation

---

### **Scenario 3: End of Day Return Report**

**Time:** 5:30 PM (End of Shift)

**Steps:**
1. Manager requests return report
2. Cashier opens **"Sales Returns"** panel
3. Selects filter: **"Today"**
4. Clicks **"Generate Report"**
5. Report opens in new window
6. Shows all 15 returns totaling NPR 45,230
7. Manager clicks **"Print Report"**
8. Report printed for records

**Result:** ✅ Daily accountability, loss prevention, management oversight

---

## 📱 Cash Drawer Panel Updates

### **New Sections**

#### **1. Cash In/Out Transactions**
Shows all cash movements during shift:
```
┌─────────────────────────────────────────┐
│ Cash In/Out Transactions                │
├─────────────────────────────────────────┤
│ 💚 Change from bank                     │
│    10:30 AM                              │
│    +NPR 10,000                           │
├─────────────────────────────────────────┤
│ 🔴 Bank deposit                         │
│    3:00 PM                               │
│    -NPR 50,000                           │
└─────────────────────────────────────────┘
```

#### **2. Expected Cash Calculation**
```
┌─────────────────────────────────────────┐
│ 💼 Starting Cash:      NPR 5,000        │
│ 💵 Cash Sales:        +NPR 32,500       │
│ 💚 Cash In:          +NPR 10,000        │
│ 🔴 Cash Out:         -NPR 50,000        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🧮 Expected Cash:    -NPR 2,500         │
└─────────────────────────────────────────┘
```

---

## 🚨 Important Notes

### **Returns**
- ⚠️ Returns reduce shift sales total
- ⚠️ Inventory automatically restored
- ⚠️ Original bill marked as "returned"
- ⚠️ Cannot return same bill twice
- ⚠️ All returns require reason

### **Cash In/Out**
- ⚠️ Only available during active shift
- ⚠️ Both require reason (mandatory)
- ⚠️ Cannot be negative amounts
- ⚠️ All transactions logged with timestamp
- ⚠️ Affects expected cash calculation

### **Shift Management**
- ⚠️ Cash In/Out buttons disabled when no shift
- ⚠️ Returns can be processed without shift (uses timestamp)
- ⚠️ End shift calculation includes Cash In/Out
- ⚠️ Transfer shift does NOT transfer Cash In/Out history

---

## 🔒 Security & Audit Trail

### **Complete Logging**

Every action recorded:
- ✅ User ID & name
- ✅ Timestamp (precise to second)
- ✅ Action type
- ✅ Amount
- ✅ Reason
- ✅ Related entities (bill, shift, items)

### **Audit Questions Answered**

1. **"Who processed this return?"**
   - `returnedBy: "John Doe"`
   - `cashierId: "cashier_1"`

2. **"When was cash removed?"**
   - `date: "2024-12-01T15:00:00.000Z"`
   - `type: "cash_out"`

3. **"Why was inventory adjusted?"**
   - `reason: "Sales return - defective product"`
   - `billNumber: "BIL-1701234567890"`

4. **"What's the expected cash?"**
   - Formula: Start + Sales + In - Out
   - All components tracked separately

---

## 🎓 Training Quick Reference

### **Cash In**
1. Green button → Top right
2. Enter amount & reason
3. Click "Add Cash"

### **Cash Out**
1. Red button → Top right
2. Enter amount & reason
3. Click "Remove Cash"

### **Sales Return**
1. New Return button → Dashboard or sidebar
2. Enter Bill ID/Number
3. Find bill
4. Select items (use +/- buttons)
5. Enter reason
6. Process return
7. Receipt prints automatically

### **Generate Report**
1. Sales Returns panel
2. Select period filter
3. Click "Generate Report"
4. Print or save

---

## ✅ Checklist

### **Before Shift**
- [ ] Count starting cash
- [ ] Start shift
- [ ] Verify Cash In/Out buttons enabled

### **During Shift**
- [ ] Process sales normally
- [ ] Record all Cash In with reason
- [ ] Record all Cash Out with reason
- [ ] Process returns with proper documentation

### **End of Shift**
- [ ] Count ending cash
- [ ] Verify expected cash matches
- [ ] Investigate discrepancies
- [ ] Generate return report (if needed)
- [ ] End shift properly

---

## 🎉 Summary

The **Complete Cashier Dashboard** now includes:

✅ **Cash In/Out Management** - Full cash drawer control  
✅ **Sales Return System** - Bill ID lookup with inventory restoration  
✅ **Automated Receipts** - Return receipts print automatically  
✅ **Recent Returns Widget** - Dashboard visibility  
✅ **Return Reports** - Printable, professional reports  
✅ **Complete Audit Trail** - Every action logged  
✅ **Inventory Sync** - Automatic restoration  
✅ **Shift Integration** - All tied to active shift  

**Your cashiers now have enterprise-level POS functionality!** 🚀

---

**Last Updated**: December 2024  
**Version**: 3.0.0  
**Status**: Production Ready ✅

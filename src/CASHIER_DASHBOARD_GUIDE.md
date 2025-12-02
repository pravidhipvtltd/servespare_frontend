# 💰 Cashier Dashboard - Complete Guide

## 📋 Overview

The **Enhanced Cashier Dashboard** is designed for front-line cashiers managing sales, billing, and shift operations in the auto parts inventory system. It includes comprehensive metrics, daily sales trends, shift management, and low stock alerts.

---

## 🎯 Key Features

### ✅ **1. Dashboard Metrics**
- Total Sales Today (Amount & Count)
- Total Returns
- Cash Sales (Amount & Quantity)
- Online Sales (Amount & Quantity)
- Low Stock Alerts

### ✅ **2. Daily Sales Graph**
- Last 7 days sales comparison
- Visual bar chart with trends
- Today highlighted in orange
- Peak day identification

### ✅ **3. Shift Management**
- Start Shift
- Transfer Shift
- End Shift
- Multiple shifts per day support
- Real-time shift tracking

### ✅ **4. Billing & POS**
- Product search & selection
- Shopping cart management
- Discount & tax calculation
- Multiple payment methods
- Change calculator
- Receipt printing

### ✅ **5. Low Stock Alerts**
- Real-time low stock notifications
- Out of stock indicators
- Visual warnings on products

---

## 📊 Dashboard Panel

### **Metric Cards**

#### **1. Total Sales Today** 💰
```
Value: NPR 45,230
Count: 28 transactions
Trend: +12%
Color: Green
Icon: DollarSign
```
- Shows total revenue for current day
- Includes transaction count
- Displays percentage increase

#### **2. Total Returns** 🔄
```
Value: 2
Count: today
Color: Red
Icon: RotateCcw
```
- Counts returned items today
- Helps track return rate

#### **3. Cash Sales** 💵
```
Value: NPR 32,500
Quantity: 18 transactions
Color: Blue
Icon: Banknote
```
- **Amount**: Total cash received
- **Quantity**: Number of cash transactions
- Important for cash drawer reconciliation

#### **4. Online Sales** 📱
```
Value: NPR 12,730
Quantity: 10 transactions
Color: Purple
Icon: Smartphone
```
- **Amount**: eSewa + Khalti + Card + Bank
- **Quantity**: Number of online transactions
- Helps track digital payment adoption

#### **5. Low Stock Alert** ⚠️
```
Value: 15 items
Count: 3 out of stock
Color: Orange
Icon: AlertTriangle
```
- Items at or below minimum stock level
- Out of stock count
- Clickable to view full list

---

## 📈 Daily Sales Graph

### **Last 7 Days Comparison**

Visual representation with:
- **X-axis**: Days of the week (Mon, Tue, Wed...)
- **Y-axis**: Sales amount (NPR)
- **Bar Width**: Percentage of max sales
- **Today**: Orange gradient bar
- **Other Days**: Blue gradient bars

### **Example Display**

```
Mon  ████████████░░░░░░░░  NPR 15,000  (12 sales)
Tue  ██████████████░░░░░░  NPR 18,000  (15 sales)
Wed  ████████████████████  NPR 25,000  (20 sales) ← Peak
Thu  ██████████░░░░░░░░░░  NPR 12,000  (10 sales)
Fri  ████████████████░░░░  NPR 20,000  (18 sales)
Sat  ██████████████░░░░░░  NPR 18,000  (14 sales)
Sun  ████████████████████  NPR 22,000  (19 sales) ← TODAY
```

### **Benefits**
- ✅ Identify sales patterns
- ✅ Compare daily performance
- ✅ Spot trends (increasing/decreasing)
- ✅ Plan inventory accordingly

---

## 🔄 Shift Management System

### **Shift States**

#### **1. No Active Shift** ⚪
- Cashier not logged in to shift
- Cannot process sales
- Must start shift first

#### **2. Active Shift** 🟢
- Shift in progress
- Can process sales
- Can transfer or end shift

#### **3. Ended Shift** 🔴
- Shift completed
- Cannot process sales
- New shift can be started

#### **4. Transferred Shift** 🔵
- Shift handed over
- New cashier takes over
- Original cashier logged out

---

### **1. Start Shift** ▶️

**Purpose**: Begin a new shift and set starting cash

**Process**:
1. Click "Start Shift" button (green)
2. Modal opens
3. Enter starting cash amount
4. Click "Start Shift" to confirm

**Example**:
```
Starting Cash: NPR 5,000
(Cash in drawer at shift start)
```

**What Happens**:
- ✅ Shift ID created
- ✅ Start time recorded
- ✅ Starting cash saved
- ✅ Cashier assigned
- ✅ Sales tracking begins

**Data Stored**:
```typescript
{
  id: "shift_1701234567890",
  date: "2024-12-01T10:00:00.000Z",
  startTime: "2024-12-01T10:00:00.000Z",
  startCash: 5000,
  cashierId: "cashier_1",
  cashierName: "John Doe",
  totalSales: 0,
  totalTransactions: 0,
  status: "active"
}
```

---

### **2. Transfer Shift** 🔄

**Purpose**: Hand over active shift to another cashier

**Process**:
1. Click "Transfer" button (blue)
2. Modal opens
3. Enter name of cashier receiving shift
4. Click "Transfer" to confirm

**Example**:
```
Transfer To: Jane Smith
Current Sales: NPR 15,000 (12 transactions)
Starting Cash: NPR 5,000
```

**What Happens**:
- ✅ Shift marked as "transferred"
- ✅ Recipient name recorded
- ✅ Original cashier logged out
- ✅ New cashier can continue

**Use Cases**:
- 🔄 Break time
- 🔄 Shift change
- 🔄 Emergency leave
- 🔄 Training handover

**Important**: New cashier should start their own shift for proper tracking!

---

### **3. End Shift** ⏹️

**Purpose**: Complete shift and reconcile cash

**Process**:
1. Click "End Shift" button (red)
2. Modal shows:
   - Starting Cash
   - Total Sales
   - Transactions count
3. Enter ending cash amount
4. Click "End Shift" to confirm

**Example Display**:
```
Starting Cash:  NPR 5,000
Shift Sales:    NPR 32,500 (18 transactions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Expected Cash:  NPR 37,500
Ending Cash:    [Enter Amount]
```

**Cash Reconciliation**:
```
Expected = Starting Cash + Cash Sales
Difference = Ending Cash - Expected

✅ Perfect Match: Difference = 0
⚠️ Overage: Difference > 0
❌ Shortage: Difference < 0
```

**What Happens**:
- ✅ Shift marked as "ended"
- ✅ End time recorded
- ✅ Ending cash saved
- ✅ Cashier logged out
- ✅ Can start new shift

---

### **Multiple Shifts Per Day** 📅

**Scenario**: Store operates in multiple shifts

**Example**:
```
Morning Shift:    8:00 AM - 2:00 PM  (Cashier A)
Afternoon Shift:  2:00 PM - 8:00 PM  (Cashier B)
Night Shift:      8:00 PM - 11:00 PM (Cashier C)
```

**Implementation**:
- Each cashier starts their own shift
- Each shift has independent tracking
- Multiple shifts stored for same day
- All shifts visible in history

**Data Structure**:
```typescript
shifts = [
  {
    id: "shift_morning",
    startTime: "2024-12-01T08:00:00Z",
    endTime: "2024-12-01T14:00:00Z",
    cashierId: "cashier_a",
    totalSales: 45000,
    status: "ended"
  },
  {
    id: "shift_afternoon",
    startTime: "2024-12-01T14:00:00Z",
    endTime: "2024-12-01T20:00:00Z",
    cashierId: "cashier_b",
    totalSales: 62000,
    status: "ended"
  },
  {
    id: "shift_night",
    startTime: "2024-12-01T20:00:00Z",
    cashierId: "cashier_c",
    totalSales: 15000,
    status: "active"
  }
]
```

---

## 🛒 Billing & POS

### **Product Selection**
- Search by name or part number
- Grid view with images
- Stock availability badges:
  - 🟢 **Green**: In Stock
  - 🟠 **Orange**: Low Stock
  - 🔴 **Red**: Out of Stock

### **Cart Management**
- Add items to cart
- Update quantities (+/-)
- Remove items
- Real-time total calculation

### **Payment Methods**
- 💵 **Cash**: Manual change calculation
- 💳 **Card**: Credit/Debit
- 📱 **eSewa**: Digital wallet
- 📱 **Khalti**: Digital wallet
- 🏦 **Bank**: Bank transfer

### **Discount & Tax**
- Discount: Percentage or Fixed amount
- VAT: 13% (Nepal standard)
- Auto-calculated totals

### **Change Calculator** (Cash Only)
```
Total Amount:     NPR 1,500
Amount Received:  NPR 2,000
━━━━━━━━━━━━━━━━━━━━━━━━
Change to Return: NPR 500
```

---

## 📱 Low Stock Alerts

### **Alert Triggers**
1. **Low Stock**: Quantity ≤ Minimum Stock Level
2. **Out of Stock**: Quantity = 0

### **Visual Indicators**

#### **Product Card**
- Orange border for low stock
- Orange icon
- Orange badge showing quantity
- Alert triangle icon

#### **Dashboard Widget**
```
⚠️ Low Stock Alerts (15)

🔧 Brake Pad Set          5 units  (Min: 10)
⚙️ Oil Filter             8 units  (Min: 15)
🔩 Spark Plug Set         3 units  (Min: 5)
💡 Headlight Bulb         0 units  (Out of Stock!)
🔧 Air Filter             4 units  (Min: 10)
```

### **Alert Actions**
1. **Inform Inventory Manager**: Report low stock
2. **Suggest Alternatives**: Offer similar products
3. **Back Order**: Note customer request

---

## 🧾 Sales History

### **Filters**
- **Today**: Current day sales
- **Week**: Last 7 days
- **Month**: Current month
- **All**: Complete history

### **Search**
- By Bill Number
- By Customer Name
- By Phone Number

### **Display**
Table showing:
- Bill Number
- Date & Time
- Customer Name
- Items Count
- Payment Method
- Total Amount
- Actions (View, Print)

---

## 💵 Cash Drawer

### **Overview Cards**

#### **1. Starting Cash**
```
NPR 5,000
└─ Cash at shift start
```

#### **2. Cash Sales**
```
NPR 32,500
└─ 18 transactions
```

#### **3. Expected Cash**
```
NPR 37,500
└─ Starting + Cash Sales
```

### **Transaction List**
Shows all cash transactions:
```
BIL-1701234567 | 10:15 AM | +NPR 1,500
BIL-1701234789 | 10:32 AM | +NPR 2,300
BIL-1701234890 | 11:05 AM | +NPR 850
...
```

---

## 🎨 UI/UX Features

### **Color Coding**
- **Green**: Success, active, in stock
- **Orange**: Warnings, low stock, today
- **Red**: Errors, out of stock, urgent
- **Blue**: Info, transfer, neutral
- **Purple**: Online payments

### **Real-time Updates**
- Clock updates every second
- Shift timer shows elapsed time
- Sales counter updates instantly
- Stock levels update on sale

### **Responsive Design**
- Mobile-friendly layout
- Touch-optimized buttons
- Swipe gestures supported
- Auto-scaling for tablets

### **Keyboard Shortcuts** (Future)
- `Ctrl + N`: New Sale
- `Ctrl + S`: Search Product
- `Ctrl + P`: Print Receipt
- `F9`: Complete Sale
- `Esc`: Cancel

---

## 📊 Calculations

### **1. Daily Sales**
```typescript
const today = new Date().toDateString();
const todayBills = bills.filter(b => 
  new Date(b.date).toDateString() === today
);
const totalSalesToday = todayBills.reduce((sum, b) => 
  sum + b.total, 0
);
```

### **2. Cash vs Online**
```typescript
// Cash Sales
const cashSales = todayBills.filter(b => 
  b.paymentMethod === 'cash'
);
const cashAmount = cashSales.reduce((sum, b) => 
  sum + b.total, 0
);

// Online Sales
const onlineSales = todayBills.filter(b => 
  ['esewa', 'khalti', 'card', 'bank'].includes(b.paymentMethod)
);
const onlineAmount = onlineSales.reduce((sum, b) => 
  sum + b.total, 0
);
```

### **3. Low Stock**
```typescript
const lowStockItems = inventory.filter(i => 
  i.quantity <= i.minStockLevel && i.quantity > 0
);
const outOfStockItems = inventory.filter(i => 
  i.quantity === 0
);
```

### **4. 7-Day Trend**
```typescript
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return date.toDateString();
}).reverse();

const salesByDay = last7Days.map(day => {
  const dayBills = bills.filter(b => 
    new Date(b.date).toDateString() === day
  );
  return {
    day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: dayBills.reduce((sum, b) => sum + b.total, 0),
    count: dayBills.length
  };
});
```

---

## 🔒 Shift Security

### **One Active Shift Per Cashier**
```typescript
// Check for existing active shift
const activeShift = shifts.find(
  s => s.cashierId === currentUser.id && s.status === 'active'
);

if (activeShift) {
  // Resume existing shift
  setCurrentShift(activeShift);
} else {
  // Allow new shift
  setShowStartShift(true);
}
```

### **Prevent Sales Without Shift**
```typescript
if (!currentShift) {
  alert('⚠️ Please start your shift first!');
  return;
}
```

---

## 🎯 Best Practices

### **For Cashiers**

1. **Start Every Day**
   - Always start shift at beginning
   - Count cash drawer accurately
   - Record exact starting amount

2. **During Shift**
   - Process sales accurately
   - Verify payment amounts
   - Alert on low stock
   - Keep workstation organized

3. **End Every Day**
   - Count ending cash carefully
   - Reconcile any differences
   - Report discrepancies
   - Complete end-of-day report

4. **Shift Transfers**
   - Hand over properly
   - Brief next cashier
   - Note any issues
   - Transfer active sales info

### **For Managers**

1. **Monitor Shifts**
   - Review daily shift reports
   - Check for discrepancies
   - Analyze sales patterns
   - Track cashier performance

2. **Stock Management**
   - Act on low stock alerts
   - Reorder proactively
   - Prevent stock-outs
   - Maintain optimal levels

3. **Cash Control**
   - Verify cash reconciliations
   - Investigate shortages/overages
   - Secure cash regularly
   - Bank deposits on time

---

## 📈 Performance Metrics

### **KPIs Tracked**

1. **Sales Volume**
   - Total transactions per shift
   - Average transaction value
   - Peak sales hours

2. **Payment Mix**
   - Cash vs Digital ratio
   - Payment method preferences
   - Transaction fees

3. **Efficiency**
   - Average transaction time
   - Items per sale
   - Queue wait times

4. **Accuracy**
   - Cash reconciliation rate
   - Return rate
   - Error rate

---

## 🚀 Future Enhancements

### **Phase 2**
- [ ] Barcode scanner integration
- [ ] Customer loyalty program
- [ ] Gift cards & vouchers
- [ ] Split payments
- [ ] Layaway management

### **Phase 3**
- [ ] Real-time manager alerts
- [ ] Video receipt email/SMS
- [ ] Product recommendations
- [ ] Upsell suggestions
- [ ] Commission tracking

### **Phase 4**
- [ ] AI-powered insights
- [ ] Predictive stock alerts
- [ ] Fraud detection
- [ ] Voice commands
- [ ] Facial recognition payments

---

## 🎓 Training Guide

### **New Cashier Onboarding**

#### **Day 1: Basics**
- System login
- Start shift
- Product search
- Add to cart
- Process cash sale
- End shift

#### **Day 2: Advanced**
- Digital payments
- Discounts & tax
- Returns processing
- Low stock alerts
- Shift transfer

#### **Day 3: Excellence**
- Cash reconciliation
- Customer service
- Upselling techniques
- Problem resolution
- Report generation

---

## 🆘 Troubleshooting

### **Common Issues**

#### **1. Can't Process Sale**
**Problem**: Button disabled  
**Solution**: Start shift first

#### **2. Product Not Found**
**Problem**: Search returns nothing  
**Solution**: Check spelling, try part number

#### **3. Cash Shortage**
**Problem**: Ending cash less than expected  
**Solution**: Recount, check transactions, report to manager

#### **4. Shift Won't End**
**Problem**: End shift button not working  
**Solution**: Complete all open transactions first

#### **5. Low Stock Alert**
**Problem**: Product shows orange warning  
**Solution**: Inform inventory manager, suggest alternatives

---

## 📞 Support

For technical issues:
- **Email**: support@servespares.com
- **Phone**: +977-XXXXXXXXXX
- **Hours**: 24/7 Support

---

## ✅ Checklist

### **Daily Opening**
- [ ] Log in to system
- [ ] Count cash drawer
- [ ] Start shift with correct amount
- [ ] Check low stock alerts
- [ ] Review pending issues

### **During Shift**
- [ ] Process sales accurately
- [ ] Verify all payments
- [ ] Alert on stock issues
- [ ] Provide excellent service
- [ ] Keep workspace clean

### **Daily Closing**
- [ ] Process final sale
- [ ] Count ending cash
- [ ] Reconcile differences
- [ ] End shift properly
- [ ] Log out securely

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅

🎉 **Your cashiers are now equipped with a professional, efficient, and comprehensive POS system!**

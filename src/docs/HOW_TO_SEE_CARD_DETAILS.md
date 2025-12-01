# How to See Card Details Form 💳

## 🎯 Step-by-Step Guide

### **Where is the Card Details Form?**

The card details form **only appears** when you select specific payment methods that require card information.

---

## 📍 **How to Access Card Details Form:**

### **Step 1: Open Payment Modal**
Click **"Get Started"** on any pricing plan (Starter, Professional, or Enterprise)

### **Step 2: Fill in Details**
Complete your personal and business information, then click **"Continue to Payment"**

### **Step 3: Select Card Payment Method**
In the **"International Methods"** section at the TOP, select either:
- ✅ **💳 Credit/Debit Card** 
- ✅ **🔴 Mastercard**

### **Step 4: Card Form Appears!**
The card details form will **smoothly expand** below the payment methods with these fields:

```
┌─────────────────────────────────────────┐
│ 🔒 Secure Card Details    💳 Visa       │
├─────────────────────────────────────────┤
│                                          │
│ Card Number *                            │
│ ┌────────────────────────────────┐ 💳   │
│ │ 1234 5678 9012 3456            │      │
│ └────────────────────────────────┘      │
│ Enter your card number to auto-detect   │
│                                          │
│ Cardholder Name *                        │
│ ┌────────────────────────────────┐      │
│ │ JOHN DOE                       │      │
│ └────────────────────────────────┘      │
│                                          │
│ Expiry Date *      CVC Code *            │
│ ┌──────────┐      ┌──────────┐          │
│ │ MM/YY    │      │ 123      │          │
│ └──────────┘      └──────────┘          │
│                   3 digits on back       │
│                                          │
│ 🔒 Your payment information is secure    │
│    We use 256-bit SSL encryption         │
└─────────────────────────────────────────┘
```

---

## ❌ **When Card Details DON'T Appear:**

The card form will **NOT** appear if you select:
- 🇳🇵 **eSewa** (Nepal digital wallet)
- 💜 **Khalti** (Nepal digital wallet)
- 📱 **FonePay** (Nepal mobile payment)
- 💵 **Cash App** (Digital payment)
- 🔷 **Stripe** (Payment processor)
- 🌍 **Wise** (Money transfer)

These methods use their own payment portals and don't need card details entered directly.

---

## 🎯 **Quick Test:**

1. **Open Pricing Page** → Click any "Get Started" button
2. **Fill Details** → Enter name, email, phone, business info
3. **Click "Continue to Payment"**
4. **Scroll to TOP** → See "International Methods" section
5. **Click "💳 Credit/Debit Card"** → Card form appears instantly!

---

## 🎨 **Visual Layout:**

### **Payment Page Structure:**

```
┌──────────────────────────────────────────────┐
│   Choose Payment Method                      │
│   Professional Plan - NPR 5,999 / month     │
│                                              │
│   [1] Details → [2] Payment → [Done]        │
├──────────────────────────────────────────────┤
│                                              │
│   Select Payment Method                      │
│                                              │
│   International Methods ← SELECT FROM HERE   │
│   ┌──────────┐  ┌──────────┐               │
│   │ 💳 Card  │  │ 🔴 MC    │               │
│   └──────────┘  └──────────┘               │
│   ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│   │ 💵 Cash  │  │ 🔷 Stripe│  │ 🌍 Wise │ │
│   └──────────┘  └──────────┘  └─────────┘ │
│                                              │
│   Nepal Payment Methods                      │
│   ┌──────────┐  ┌──────────┐               │
│   │🇳🇵 eSewa │  │ 💜 Khalti │               │
│   └──────────┘  └──────────┘               │
│   ┌──────────┐                              │
│   │📱FonePay │                              │
│   └──────────┘                              │
│                                              │
│   ↓↓↓ CARD FORM APPEARS HERE ↓↓↓           │
│   (When 💳 or 🔴 is selected)              │
│                                              │
│   Order Summary                              │
│   ┌──────────────────────────────────────┐ │
│   │ Plan: Professional                   │ │
│   │ Billing: Monthly                     │ │
│   │ ─────────────────────────────────    │ │
│   │ Total: NPR 5,999                     │ │
│   └──────────────────────────────────────┘ │
│                                              │
│   [← Back]              [Pay Now →]         │
└──────────────────────────────────────────────┘
```

---

## 🔍 **Troubleshooting:**

### **Problem: Card form not showing?**

**Check these:**
1. ✅ Are you on **Step 2: Payment**? (Check progress bar at top)
2. ✅ Did you select **💳 Credit/Debit Card** or **🔴 Mastercard**?
3. ✅ Are you looking in the **International Methods** section?
4. ✅ Try scrolling - the form might be below the fold

### **Solution:**
- Click on **"💳 Credit/Debit Card"** in the top section
- The card form will **smoothly expand** with animation
- If still not visible, try refreshing and starting again

---

## ✨ **What Happens When You Select Card Payment:**

```
1. User clicks "💳 Credit/Debit Card"
   ↓
2. Payment method highlights with blue border
   ↓
3. Checkmark appears in top-right corner
   ↓
4. Card details form smoothly expands (300ms animation)
   ↓
5. Form shows with 4 input fields:
   - Card Number (auto-formatted)
   - Cardholder Name (auto-uppercase)
   - Expiry Date (MM/YY format)
   - CVC Code (3-4 digits)
   ↓
6. As you type card number, it auto-detects brand
   ↓
7. Badge appears showing "💳 Visa" or "🔴 Mastercard" etc.
   ↓
8. Security badge shows at bottom
   ↓
9. Fill all fields and click "Pay Now"
```

---

## 📸 **Screenshots Location:**

The card details form appears **between** the payment method selection and the Order Summary section.

**Scroll position:** Middle of the modal
**Visibility:** Immediately after selecting card payment
**Animation:** Smooth expand from height 0 to auto

---

## ✅ **Verification Checklist:**

To confirm you're seeing the card form correctly:

- [ ] Modal is open
- [ ] Progress shows "2 Payment" (active)
- [ ] "International Methods" section visible at top
- [ ] Selected "💳 Credit/Debit Card" or "🔴 Mastercard"
- [ ] Blue border around selected payment method
- [ ] Checkmark visible on selected method
- [ ] Form with "🔒 Secure Card Details" heading visible
- [ ] 4 input fields visible (Card Number, Name, Expiry, CVC)
- [ ] Security badge at bottom of form
- [ ] Order Summary below the card form

---

## 🎯 **Summary:**

**Card Details Form Location:**
```
Payment Modal
  └─ Step 2: Payment
      ├─ International Methods (TOP)
      │   └─ Select: 💳 Card or 🔴 Mastercard
      │
      ├─ [CARD DETAILS FORM APPEARS HERE] ← YOUR FORM
      │   ├─ Card Number
      │   ├─ Cardholder Name
      │   ├─ Expiry Date
      │   ├─ CVC Code
      │   └─ Security Badge
      │
      ├─ Order Summary
      └─ [Back] [Pay Now]
```

**To see it:**
1. Select "💳 Credit/Debit Card" from International Methods
2. Form expands instantly
3. Fill in your card details
4. Auto-detection works as you type

---

**Status:** ✅ **Card form is working correctly!**

The form only appears for card payment methods (not digital wallets like eSewa/Khalti).

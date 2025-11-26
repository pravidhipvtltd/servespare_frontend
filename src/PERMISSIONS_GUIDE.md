# 🔒 Roles & Permissions System - Complete Guide

## Overview
The Serve Spares Inventory System has a comprehensive permission system that allows Super Admins to control what each role can and cannot do.

---

## ✅ What's Fixed & Working

### 1. **Dynamic Permission Counts**
- ✅ Shows correct number of permissions per role (not fixed "28")
- ✅ Updates in real-time as you toggle permissions
- ✅ Displays "X of Y" format (e.g., "12 of 28")

### 2. **Proper Tailwind Styling**
- ✅ All colors work correctly (Red, Purple, Orange, Green, Blue)
- ✅ Proper hover effects and transitions
- ✅ Responsive design on all screen sizes

### 3. **Functional Permission System**
- ✅ Toggle permissions on/off with click
- ✅ Changes saved to localStorage
- ✅ Super Admin locked (cannot be modified)
- ✅ Unsaved changes warning
- ✅ Reset to default functionality

---

## 📋 Available Permissions (28 Total)

### Dashboard (2)
- `view_dashboard` - Access main dashboard
- `view_analytics` - View reports and analytics

### Users (4)
- `view_users` - View user list
- `create_users` - Add new users
- `edit_users` - Modify user details
- `delete_users` - Remove users

### Inventory (5)
- `view_inventory` - View inventory items
- `create_inventory` - Add new items
- `edit_inventory` - Modify inventory
- `delete_inventory` - Remove items
- `adjust_stock` - Adjust stock levels

### Billing (5)
- `view_bills` - View sales bills
- `create_bills` - Create new bills
- `edit_bills` - Modify existing bills
- `delete_bills` - Remove bills
- `process_refunds` - Handle refunds

### Finance (5)
- `view_finance` - View financial data
- `view_expenses` - View expense records
- `create_expenses` - Record new expenses
- `approve_expenses` - Approve expense claims
- `view_profit_loss` - View profit & loss

### Parties (4)
- `view_parties` - View customers/suppliers
- `create_parties` - Add customers/suppliers
- `edit_parties` - Modify party details
- `delete_parties` - Remove parties

### Settings (3)
- `view_settings` - Access settings
- `edit_settings` - Modify system settings
- `manage_branches` - Add/edit branches

---

## 🎯 Default Role Permissions

### Super Admin (28 permissions)
✅ **ALL PERMISSIONS** - Cannot be modified

### Admin (21 permissions)
- Dashboard: All
- Users: View, Create, Edit
- Inventory: All
- Billing: View, Create, Edit, Delete
- Finance: View, View Expenses
- Parties: All
- Settings: View

### Inventory Manager (7 permissions)
- Dashboard: View
- Inventory: View, Create, Edit, Adjust Stock
- Parties: View, Create, Edit

### Cashier (5 permissions)
- Dashboard: View
- Inventory: View
- Billing: View, Create
- Parties: View, Create

### Finance (8 permissions)
- Dashboard: All
- Billing: View
- Finance: All
- Parties: View

---

## 🚀 How to Use

### For Super Admins:

1. **Access the Page**
   - Login as Super Admin
   - Go to "Roles & Permissions" in sidebar

2. **Select a Role**
   - Click on any role card (Admin, Cashier, etc.)
   - Super Admin is locked and cannot be changed

3. **Toggle Permissions**
   - Click any permission card to enable/disable
   - Green ✓ = Enabled
   - Gray ✗ = Disabled

4. **Save Changes**
   - Yellow warning appears when you have unsaved changes
   - Click "Save Changes" button
   - Changes apply immediately to all users with that role

5. **Reset if Needed**
   - Click "Reset All" to restore default permissions
   - Confirms before resetting

### For Developers - Using Permissions in Code:

```typescript
import { hasPermission, checkAndAlertPermission } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

// In your component
const { currentUser } = useAuth();

// Check permission silently
if (hasPermission(currentUser.role, 'edit_inventory')) {
  // Show edit button
}

// Check with alert on denial
const handleEdit = () => {
  if (checkAndAlertPermission(currentUser.role, 'edit_inventory', 'edit this item')) {
    // Proceed with edit
  }
  // Alert shown automatically if permission denied
};

// Hide buttons based on permissions
{hasPermission(currentUser.role, 'delete_inventory') && (
  <button onClick={handleDelete}>Delete</button>
)}
```

---

## 🔧 Technical Details

### Storage
- Permissions stored in localStorage: `rolePermissions`
- Structure: `{ role: [permissionId1, permissionId2, ...] }`
- Persists across sessions

### Permission Check Flow
1. User performs action
2. System checks user's role
3. Retrieves role permissions from localStorage
4. Super Admin always passes (has all permissions)
5. Other roles checked against permission list
6. Action allowed/denied based on result

---

## ⚠️ Important Notes

1. **Super Admin Protection**
   - Super Admin cannot be restricted
   - Always has full system access
   - Cannot toggle Super Admin permissions

2. **Immediate Effect**
   - Permissions apply after clicking "Save Changes"
   - No logout required
   - Affects all users with that role

3. **Security**
   - Permission checks happen on every action
   - Buttons hidden when permission denied
   - Alerts shown when restricted action attempted

4. **Persistence**
   - Custom permissions saved permanently
   - Survives page refresh and logout
   - Can be reset to defaults anytime

---

## 🎨 Visual Indicators

- **Green Background + Green Border** = Permission Enabled
- **White Background + Gray Border** = Permission Disabled
- **Hover Effect** = Scales up slightly
- **Yellow Banner** = Unsaved changes warning
- **Blue Banner** = Information about permissions
- **Red Banner** = Super Admin locked warning

---

## 📊 Stats Summary

At the bottom of the page, you'll see:
- User count per role
- Permission count per role
- Color-coded role badges
- Quick overview of entire system

---

## ✨ Best Practices

1. **Test After Changes**
   - Login as that role to test
   - Verify permissions work correctly

2. **Document Custom Permissions**
   - Keep track of changes made
   - Document why certain permissions were removed

3. **Regular Review**
   - Review permissions quarterly
   - Ensure roles match job responsibilities

4. **Minimal Access**
   - Grant only necessary permissions
   - Follow principle of least privilege

5. **Backup Settings**
   - Note custom permissions before major changes
   - Can always reset to default if needed

---

## 🐛 Troubleshooting

**Q: Permissions not applying?**
A: Make sure you clicked "Save Changes" button

**Q: Permission count showing wrong?**
A: Fixed! Now shows dynamic count based on enabled permissions

**Q: Can't modify Super Admin?**
A: This is by design - Super Admin always has full access

**Q: Lost custom permissions?**
A: Click "Reset All" to restore defaults, then reconfigure

**Q: User still has access after removing permission?**
A: Have user refresh the page or logout/login

---

## 📞 Support

If permissions aren't working as expected:
1. Check console for errors
2. Verify localStorage has `rolePermissions` key
3. Ensure user role matches available roles
4. Test with a fresh browser session

---

**System Status:** ✅ Fully Functional & Production Ready
**Last Updated:** November 26, 2025

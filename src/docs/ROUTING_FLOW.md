# Complete Application Routing Flow

## 🎯 Main Application Flow

```
                        ┌─────────────┐
                        │   App.tsx   │
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │   AuthProvider      │
                    │   LanguageProvider  │
                    │   SyncProvider      │
                    │   PermissionProvider│
                    └──────────┬──────────┘
                               │
                        ┌──────▼───────┐
                        │  AppContent  │
                        └──────┬───────┘
                               │
                     Check: currentUser?
                               │
                ┌──────────────┴──────────────┐
                │                             │
           NO   ▼                        YES  ▼
        ┌──────────────┐         Check: needsProfileCompletion?
        │ LandingPage  │                      │
        └──────┬───────┘         ┌────────────┴────────────┐
               │             YES │                      NO  │
               │           ┌─────▼─────────┐         ┌─────▼─────────┐
               │           │Profile        │         │Role-based     │
               │           │Completion     │         │Dashboard      │
               │           └───────────────┘         │Routing        │
               │                                     └─────┬─────────┘
               │                                           │
               │                        ┌──────────────────┼──────────────────┐
               │                        │                  │                  │
               │                   super_admin          admin         inventory_manager
               │                        │                  │                  │
               │                        ▼                  ▼                  ▼
               │              ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
               │              │ SuperAdmin   │   │    Admin     │   │  Inventory   │
               │              │  Dashboard   │   │  Dashboard   │   │   Manager    │
               │              └──────────────┘   └──────────────┘   │  Dashboard   │
               │                                                    └──────────────┘
               │                  cashier              finance
               │                     │                    │
               │                     ▼                    ▼
               │            ┌──────────────┐   ┌──────────────┐
               │            │   Cashier    │   │   Finance    │
               │            │  Dashboard   │   │  Dashboard   │
               │            └──────────────┘   └──────────────┘
               │
        ┌──────▼───────┐
        │    Login     │
        │  Options     │
        └──────┬───────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
Regular   Continue   Forgot
Login     with      Password
          Email
```

## 📱 Landing Page Routes

```
┌────────────────────┐
│   LandingPage      │
└─────────┬──────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│ Login  │  │Register│
└───┬────┘  └───┬────┘
    │           │
    └─────┬─────┘
          ▼
┌──────────────────┐
│ ModernAuthPage   │
│ (Split Screen)   │
└─────────┬────────┘
          │
    ┌─────┴─────────────────┐
    │                       │
    ▼                       ▼
Left Side              Right Side
(Visual)               (Form)
- Animated             - Login Form
  Background           - Register Form
- Floating             - Switch Toggle
  Icons
- Features
- Stats
```

## 🔐 Authentication Routes

### Login Options
```
┌──────────────────────┐
│   Login Form         │
└──────────┬───────────┘
           │
    ┌──────┴──────┬──────────────┬─────────────┐
    │             │              │             │
    ▼             ▼              ▼             ▼
Regular      Continue       Forgot        Sign Up
Login        with Email     Password      Link
    │             │              │             │
    ▼             ▼              ▼             │
Login()    EmailOTPLogin  ForgotPassword      │
    │             │              │             │
    │             │              │             │
    ▼             ▼              ▼             │
Dashboard    OTP→Dashboard  Reset→Login       │
                                               ▼
                                        Register Form
```

### Continue with Email Flow
```
┌──────────────────────┐
│  Click "Continue     │
│   with Email"        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  EmailOTPLogin       │
│  Component           │
└──────────┬───────────┘
           │
    Enter Email
           │
           ▼
┌──────────────────────┐
│  Send OTP            │
│  (Server Call)       │
└──────────┬───────────┘
           │
    OTP Sent
           │
           ▼
┌──────────────────────┐
│  OTPVerification     │
│  Component           │
└──────────┬───────────┘
           │
    Enter 6-Digit OTP
           │
           ▼
┌──────────────────────┐
│  Verify OTP          │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
Existing       New User
User              │
    │             ▼
    │      ┌──────────────┐
    │      │Create Account│
    │      │ in localStorage
    │      └──────┬───────┘
    │             │
    │      Set needsProfile
    │      Completion = true
    │             │
    ▼             ▼
Set currentUser
in localStorage
    │             │
    └──────┬──────┘
           │
    window.location
       .href = '/'
           │
           ▼
┌──────────────────────┐
│  App.tsx Reloads     │
└──────────┬───────────┘
           │
    AuthContext loads
    currentUser
           │
    ┌──────┴──────┐
    │             │
Profile       No Profile
Complete      Completion
Needed           │
    │             ▼
    │      ┌──────────────┐
    │      │Profile       │
    │      │Completion    │
    │      │ Component    │
    │      └──────┬───────┘
    │             │
    │      Complete/Skip
    │             │
    └──────┬──────┘
           │
           ▼
┌──────────────────────┐
│   Admin Dashboard    │
└──────────────────────┘
```

## 🔄 Registration Flow

```
┌──────────────────────┐
│  Register Form       │
└──────────┬───────────┘
           │
    Fill All Fields:
    - Business Name
    - Owner Name
    - Email
    - Phone Number
    - Password
    - Confirm Password
    - Address
    - PAN/VAT Number
    - Document Upload
           │
           ▼
┌──────────────────────┐
│  Click "Create       │
│   Account"           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Send OTP to Email   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  OTPVerification     │
│  Component           │
└──────────┬───────────┘
           │
    Enter OTP
           │
           ▼
┌──────────────────────┐
│  Verify OTP          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Save User to        │
│  localStorage        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Success Alert       │
│  "Registration       │
│   successful!"       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Redirect to         │
│  Login Mode          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  User can now        │
│  login with          │
│  Email + Password    │
└──────────────────────┘
```

## 🔐 Forgot Password Flow

```
┌──────────────────────┐
│  Click "Forgot       │
│   Password?"         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  ForgotPassword      │
│  Component           │
│  (Step 1: Email)     │
└──────────┬───────────┘
           │
    Enter Email
           │
           ▼
┌──────────────────────┐
│  Check User Exists   │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
  Exists      Not Found
    │             │
    │             ▼
    │      Show Error
    │             │
    ▼             └──► Back
Send OTP
    │
    ▼
┌──────────────────────┐
│  OTPVerification     │
│  Component           │
│  (Step 2: OTP)       │
└──────────┬───────────┘
           │
    Enter OTP
           │
           ▼
┌──────────────────────┐
│  Verify OTP          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  ForgotPassword      │
│  Component           │
│  (Step 3: New Pass)  │
└──────────┬───────────┘
           │
    Enter New Password
    Confirm Password
           │
           ▼
┌──────────────────────┐
│  Update Password     │
│  in localStorage     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Success Screen      │
│  (Step 4: Success)   │
└──────────┬───────────┘
           │
    Click "Back to Login"
           │
           ▼
┌──────────────────────┐
│  ModernAuthPage      │
│  (Login Mode)        │
└──────────────────────┘
```

## 🎯 Dashboard Routing Logic

```javascript
// In App.tsx - AppContent component

const { currentUser, isLoading } = useAuth();
const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

// Check profile completion status
useEffect(() => {
  if (currentUser) {
    const needsCompletion = localStorage.getItem('needsProfileCompletion') === 'true';
    setNeedsProfileCompletion(needsCompletion);
  }
}, [currentUser]);

// Routing logic
if (isLoading) return <LoadingScreen />;
if (!currentUser) return <LandingPage />;
if (needsProfileCompletion) return <ProfileCompletion />;

// Role-based routing
switch (currentUser.role) {
  case 'super_admin': return <SuperAdminDashboard />;
  case 'admin': return <AdminDashboard />;
  case 'inventory_manager': return <InventoryManagerDashboard />;
  case 'cashier': return <CashierDashboard />;
  case 'finance': return <FinanceDashboard />;
  default: return <LandingPage />;
}
```

## 🔑 LocalStorage Keys

```javascript
// User Authentication
'currentUser'              // Currently logged-in user object
'users'                    // Array of all registered users

// Profile Completion
'needsProfileCompletion'   // Flag: 'true' or removed

// OTP Verification
'otpStore'                 // Temporary OTP storage (server-side in production)

// Session Management
// (Handled by AuthContext via currentUser)
```

## 📍 URL Routes (Single Page Application)

Since this is a SPA (Single Page Application), there are no traditional URL routes. The routing is handled by React state and conditional rendering:

```
Current URL: /
  │
  ├─ No User → LandingPage
  │    ├─ Login Button → ModernAuthPage (mode: 'login')
  │    └─ Register Button → ModernAuthPage (mode: 'register')
  │
  ├─ User + needsProfileCompletion → ProfileCompletion
  │
  └─ User + No Profile Needed → Role-based Dashboard
       ├─ super_admin → SuperAdminDashboard
       ├─ admin → AdminDashboard
       ├─ inventory_manager → InventoryManagerDashboard
       ├─ cashier → CashierDashboard
       └─ finance → FinanceDashboard
```

## 🚀 Navigation Methods

1. **Component State Changes**
   - `setMode('login')` / `setMode('register')`
   - `setEmailOtpMode(true)` / `setEmailOtpMode(false)`
   - `setShowForgotPassword(true)` / `setShowForgotPassword(false)`

2. **Page Reloads**
   - `window.location.reload()` - After profile completion
   - `window.location.href = '/'` - After OTP verification

3. **AuthContext Updates**
   - `login()` - Sets currentUser
   - `logout()` - Clears currentUser
   - `refreshUser()` - Updates currentUser data

## ✅ Complete Workflow Summary

1. **Landing Page** → User clicks Login/Register
2. **ModernAuthPage** → User chooses authentication method
3. **Email OTP Login** → User enters email → OTP verification
4. **Profile Completion** → New users complete profile (optional)
5. **Dashboard** → Role-based dashboard loads
6. **Forgot Password** → Reset password with OTP verification

All routes are properly connected and tested! 🎉

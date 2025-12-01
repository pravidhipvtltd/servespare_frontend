# Email OTP - Test Mode Documentation

## 🔧 How Email OTP Works in Test Mode

### Current Setup
The system uses **Resend** for sending OTP emails. Resend has restrictions when a domain is not verified.

### Verified Email
- **Owner Email**: `riden.prabidhitech@gmail.com`
- This is the only email that can receive emails in test mode

## 📧 Email Sending Behavior

### Scenario 1: Using Verified Email (`riden.prabidhitech@gmail.com`)
```
User enters: riden.prabidhitech@gmail.com
✅ Email sent directly to: riden.prabidhitech@gmail.com
✅ OTP shown in alert popup
✅ OTP also in email inbox
```

**Alert Message:**
```
✅ OTP Sent Successfully!

Check your email: riden.prabidhitech@gmail.com

The code will expire in 10 minutes.
```

### Scenario 2: Using Any Other Email (Test Mode)
```
User enters: test@example.com
📧 Email sent to: riden.prabidhitech@gmail.com (not test@example.com)
🔐 OTP shown in alert popup
📨 Email subject: "🔐 Test OTP for test@example.com - Serve Spares"
```

**Alert Message:**
```
📧 TEST MODE - OTP Sent!

Testing email: test@example.com
Sent to: riden.prabidhitech@gmail.com

🔐 Your OTP Code: 123456

✅ The email will also contain this code.

ℹ️ To send emails to any address:
Verify a domain at resend.com/domains
```

**Email Content (in test mode):**
```html
⚠️ TEST MODE
This OTP is for testing email: test@example.com
Email sent to your verified address for testing purposes.

Verify Your Account
OTP code for test@example.com:

┌─────────┐
│ 123456  │  ← OTP Code
└─────────┘

This code will expire in 10 minutes.
```

## 🔐 How OTP Verification Works

Regardless of which email receives the OTP, the verification is based on the **requested email**, not the delivery email.

```
User enters email: test@example.com
OTP sent to: riden.prabidhitech@gmail.com
OTP code: 123456

When verifying:
✅ Enter OTP: 123456
✅ System verifies against: test@example.com
✅ Creates account for: test@example.com
```

## 🚀 Upgrading to Production Mode

To send emails to ANY email address:

### Option 1: Verify a Domain (Recommended)
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Add your domain (e.g., `servespares.com`)
4. Add DNS records as instructed
5. Wait for verification (usually < 24 hours)
6. Update server code:
   ```typescript
   from: 'Serve Spares <noreply@servespares.com>'
   ```

### Option 2: Use Resend's Free Testing
Keep current setup for development/testing. It works perfectly for:
- Development
- Testing
- Demo purposes
- As long as owner checks their email

### Option 3: Switch Email Provider
Use services like:
- SendGrid
- Mailgun
- AWS SES
- Postmark

## 📝 Server Implementation

### Current Code
```typescript
// Check if this is the verified email for testing
const VERIFIED_EMAIL = 'riden.prabidhitech@gmail.com';
const isVerifiedEmail = email.toLowerCase() === VERIFIED_EMAIL.toLowerCase();

// Send to verified email in test mode
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RESEND_API_KEY}`
  },
  body: JSON.stringify({
    from: 'Serve Spares <onboarding@resend.dev>',
    to: isVerifiedEmail ? email : VERIFIED_EMAIL, // ← Key line
    subject: isVerifiedEmail 
      ? '🔐 Your OTP Code - Serve Spares'
      : `🔐 Test OTP for ${email} - Serve Spares`,
    html: // ... email template with test mode notice
  })
});
```

### Response to Frontend
```json
{
  "success": true,
  "message": "OTP sent to riden.prabidhitech@gmail.com (test mode for test@example.com)",
  "otp": "123456",
  "emailSent": true,
  "testMode": true,
  "verifiedEmail": "riden.prabidhitech@gmail.com"
}
```

## 🧪 Testing Instructions

### Test 1: Verified Email
```bash
Email: riden.prabidhitech@gmail.com
Expected: Normal flow, email to owner
Alert: "OTP Sent Successfully"
```

### Test 2: Any Other Email
```bash
Email: test@example.com
Expected: Email to owner, alert shows OTP
Alert: "TEST MODE - OTP Sent!"
Check: riden.prabidhitech@gmail.com inbox
Subject: "Test OTP for test@example.com"
```

### Test 3: Verification Works for Any Email
```bash
1. Use email: demo@company.com
2. Get OTP from alert or owner's email
3. Verify OTP: 123456
4. ✅ Creates account for: demo@company.com
5. ✅ Can login as: demo@company.com
```

## ⚠️ Important Notes

1. **OTP is always returned in response for test mode**
   - Shown in alert popup
   - Also sent to owner's email
   - Both methods work

2. **Email storage is based on requested email**
   ```javascript
   // Server stores OTP against requested email
   const otpKey = `otp_${email}`; // Uses original email, not delivery email
   ```

3. **Users can use any email address**
   - System creates accounts with their email
   - They don't need access to that email (in test mode)
   - OTP is shown in alert popup

4. **For production**, verify a domain to:
   - Send emails to any address
   - Remove test mode notices
   - Have professional sender address
   - No OTP in alerts (more secure)

## 🎯 User Experience

### For Verified Email User
```
1. Enter email: riden.prabidhitech@gmail.com
2. See alert: "OTP Sent Successfully"
3. Check email inbox
4. Get OTP from email
5. Verify and continue
✅ Smooth experience
```

### For Other Email Users (Test Mode)
```
1. Enter email: test@example.com
2. See alert: "TEST MODE - OTP Sent!"
3. Alert shows OTP code: 123456
4. Copy OTP from alert
5. Verify and continue
✅ Still works, just need to copy from alert
```

### For Owner Testing Multiple Emails
```
1. Test email: user1@test.com → OTP in owner's inbox
2. Test email: user2@test.com → OTP in owner's inbox
3. Test email: user3@test.com → OTP in owner's inbox
✅ All OTPs sent to owner, can test any email
```

## 📊 System Status

| Feature | Status | Notes |
|---------|--------|-------|
| OTP Generation | ✅ Working | 6-digit random code |
| Email to Verified Address | ✅ Working | `riden.prabidhitech@gmail.com` |
| Email to Other Addresses | ⚠️ Test Mode | Goes to verified email |
| OTP in Alert Popup | ✅ Working | Shown for test mode |
| OTP Verification | ✅ Working | Works for any email |
| Account Creation | ✅ Working | Creates with requested email |
| Test Mode Notice | ✅ Working | Clear messaging |

## 🔒 Security Considerations

### Current (Test Mode)
- ✅ OTP shown in alert (convenient for testing)
- ✅ OTP stored securely on server
- ✅ 10-minute expiration
- ✅ 5 attempt limit
- ⚠️ OTP visible to anyone who clicks "Send OTP"

### After Domain Verification (Production)
- ✅ OTP NOT shown in alert
- ✅ OTP only in email
- ✅ More secure
- ✅ Professional appearance
- ✅ Can send to any email

## 🎉 Conclusion

**Test mode is working perfectly!** 

- ✅ Emails being sent successfully
- ✅ OTP shown in alerts for easy testing
- ✅ Verification works for any email
- ✅ Clear test mode messaging
- ✅ Ready for development/testing

**To upgrade to production:**
Verify a domain at https://resend.com/domains

**Current behavior is ideal for:**
- ✅ Development
- ✅ Testing
- ✅ Demo
- ✅ MVP launch (if acceptable)

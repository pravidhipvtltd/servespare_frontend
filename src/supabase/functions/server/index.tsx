import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9e3b22f5/health", (c) => {
  return c.json({ status: "ok" });
});

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email using Resend
async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }

    // Check if this is the verified email for testing
    const VERIFIED_EMAIL = 'riden.prabidhitech@gmail.com';
    const isVerifiedEmail = email.toLowerCase() === VERIFIED_EMAIL.toLowerCase();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Serve Spares <onboarding@resend.dev>',
        to: isVerifiedEmail ? email : VERIFIED_EMAIL, // Send to verified email in test mode
        subject: isVerifiedEmail 
          ? '🔐 Your OTP Code - Serve Spares'
          : `🔐 Test OTP for ${email} - Serve Spares`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 40px 30px; text-align: center; }
              .otp-box { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-size: 42px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; margin: 30px 0; display: inline-block; }
              .info { color: #666; font-size: 14px; margin-top: 20px; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
              .test-notice { background: #fef3c7; border: 2px solid #f59e0b; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔧 Serve Spares</h1>
                <p>Inventory Management System</p>
              </div>
              <div class="content">
                ${!isVerifiedEmail ? `
                  <div class="test-notice">
                    <strong>⚠️ TEST MODE</strong><br>
                    This OTP is for testing email: <strong>${email}</strong><br>
                    Email sent to your verified address for testing purposes.
                  </div>
                ` : ''}
                <h2>Verify Your Account</h2>
                <p>${isVerifiedEmail ? 'Enter this OTP code to complete your verification:' : `OTP code for ${email}:`}</p>
                <div class="otp-box">${otp}</div>
                <p class="info">This code will expire in 10 minutes.</p>
                <p class="info">If you didn't request this code, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Serve Spares. All rights reserved.</p>
                <p>Auto Parts Inventory Management System</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Email OTP sent successfully to ${email}${!isVerifiedEmail ? ' (via verified email)' : ''}`);
      return true;
    } else {
      console.error('❌ Email OTP error:', result);
      
      // Check if it's the testing restriction error
      if (result.statusCode === 403 && result.message?.includes('testing emails')) {
        console.warn('⚠️ RESEND IN TEST MODE: Can only send to verified email. To fix this:');
        console.warn('   1. Verify a domain at https://resend.com/domains');
        console.warn('   2. Update the "from" address to use your verified domain');
        console.warn('   3. Or use the verified email for testing');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

// POST /make-server-9e3b22f5/send-otp
app.post("/make-server-9e3b22f5/send-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in KV store with 10 minute expiration
    const otpKey = `otp_${email}`;
    const otpData = {
      otp,
      email,
      timestamp: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
      attempts: 0
    };

    await kv.set(otpKey, JSON.stringify(otpData));
    
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP via Email
    const emailSent = await sendEmailOTP(email, otp);

    // For development/testing, log the OTP
    console.log(`=== OTP SENT ===`);
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`Email Sent: ${emailSent}`);
    console.log(`===============`);

    // Check if this is test mode (not the verified email)
    const VERIFIED_EMAIL = 'riden.prabidhitech@gmail.com';
    const isTestMode = email.toLowerCase() !== VERIFIED_EMAIL.toLowerCase();

    return c.json({ 
      success: true, 
      message: emailSent 
        ? (isTestMode 
            ? `OTP sent to ${VERIFIED_EMAIL} (test mode for ${email})` 
            : 'OTP sent to your email')
        : 'OTP generated (email delivery in test mode)',
      otp: isTestMode ? otp : undefined, // Always show OTP in test mode
      emailSent,
      testMode: isTestMode,
      verifiedEmail: isTestMode ? VERIFIED_EMAIL : undefined
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return c.json({ error: error.message || 'Failed to send OTP' }, 500);
  }
});

// POST /make-server-9e3b22f5/verify-otp
app.post("/make-server-9e3b22f5/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return c.json({ error: 'Email and OTP are required' }, 400);
    }

    // Get stored OTP data
    const otpKey = `otp_${email}`;
    const storedData = await kv.get(otpKey);

    if (!storedData) {
      return c.json({ error: 'OTP not found or expired' }, 400);
    }

    const otpData = JSON.parse(storedData);

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      await kv.del(otpKey);
      return c.json({ error: 'OTP has expired. Please request a new one.' }, 400);
    }

    // Check attempt limit (max 5 attempts)
    if (otpData.attempts >= 5) {
      await kv.del(otpKey);
      return c.json({ error: 'Too many failed attempts. Please request a new OTP.' }, 400);
    }

    // Verify OTP
    if (otp !== otpData.otp) {
      // Increment attempts
      otpData.attempts += 1;
      await kv.set(otpKey, JSON.stringify(otpData));
      
      return c.json({ 
        error: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.`,
        attemptsRemaining: 5 - otpData.attempts
      }, 400);
    }

    // OTP is valid - delete it from store
    await kv.del(otpKey);

    console.log(`OTP verified successfully for ${email}`);

    return c.json({ 
      success: true, 
      message: 'OTP verified successfully',
      email
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return c.json({ error: error.message || 'Failed to verify OTP' }, 500);
  }
});

Deno.serve(app.fetch);
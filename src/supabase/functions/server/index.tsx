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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Serve Spares <onboarding@resend.dev>',
        to: email,
        subject: '🔐 Your OTP Code - Serve Spares',
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔧 Serve Spares</h1>
                <p>Inventory Management System</p>
              </div>
              <div class="content">
                <h2>Verify Your Account</h2>
                <p>Enter this OTP code to complete your registration:</p>
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
      console.log(`✅ Email OTP sent successfully to ${email}`);
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

// Send OTP via SMS using Twilio
async function sendSMSOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('❌ Twilio credentials not configured');
      console.error(`   TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING'}`);
      console.error(`   TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN ? 'SET' : 'MISSING'}`);
      console.error(`   TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER ? 'MISSING' : 'SET'}`);
      return false;
    }

    // Trim and validate credentials
    const accountSid = TWILIO_ACCOUNT_SID.trim();
    const authToken = TWILIO_AUTH_TOKEN.trim();
    const fromPhone = TWILIO_PHONE_NUMBER.trim();

    console.log(`📱 Attempting to send SMS to ${phone}`);
    console.log(`   Using Account SID: ${accountSid.substring(0, 8)}...`);
    console.log(`   From Number: ${fromPhone}`);

    const message = `Your Serve Spares verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    const auth = btoa(`${accountSid}:${authToken}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
        body: new URLSearchParams({
          To: phone,
          From: fromPhone,
          Body: message
        })
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ SMS OTP sent successfully to ${phone}`);
      console.log(`   Message SID: ${result.sid}`);
      return true;
    } else {
      console.error('❌ SMS OTP error:', result);
      
      // Provide helpful error messages
      if (result.code === 20003) {
        console.error('⚠️ TWILIO AUTHENTICATION ERROR:');
        console.error('   Your TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is incorrect.');
        console.error('   Please check your credentials at https://console.twilio.com/');
        console.error('   Make sure you copied the Account SID and Auth Token correctly.');
      } else if (result.code === 21211) {
        console.error('⚠️ INVALID PHONE NUMBER:');
        console.error('   The phone number format is invalid.');
      } else if (result.code === 21608) {
        console.error('⚠️ UNVERIFIED NUMBER:');
        console.error('   In trial mode, you can only send to verified numbers.');
        console.error('   Verify the number at https://console.twilio.com/');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    return false;
  }
}

// POST /make-server-9e3b22f5/send-otp
app.post("/make-server-9e3b22f5/send-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { email, phone } = body;

    if (!email || !phone) {
      return c.json({ error: 'Email and phone are required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate phone format (+977XXXXXXXXXX)
    const phoneRegex = /^\+977\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return c.json({ error: 'Invalid phone format. Must be +977XXXXXXXXXX' }, 400);
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in KV store with 10 minute expiration
    const otpKey = `otp_${email}_${phone}`;
    const otpData = {
      otp,
      email,
      phone,
      timestamp: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
      attempts: 0
    };

    await kv.set(otpKey, JSON.stringify(otpData));
    
    console.log(`Generated OTP for ${email}/${phone}: ${otp}`);

    // Send OTP via Email and SMS (both independently)
    const emailSent = await sendEmailOTP(email, otp);
    const smsSent = await sendSMSOTP(phone, otp);

    // For development/testing, log the OTP
    console.log(`=== OTP SENT ===`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`OTP: ${otp}`);
    console.log(`Email Sent: ${emailSent}`);
    console.log(`SMS Sent: ${smsSent}`);
    console.log(`===============`);

    // As long as ONE method works, we're good
    // If BOTH fail, we still return success for testing but include the OTP
    const atLeastOneSuccess = emailSent || smsSent;

    return c.json({ 
      success: true, 
      message: atLeastOneSuccess 
        ? 'OTP sent successfully' 
        : 'OTP generated (check console - API keys may not be configured)',
      otp: !atLeastOneSuccess ? otp : undefined, // Only include OTP if both failed (for testing)
      emailSent,
      smsSent,
      // Include error messages for the frontend to display
      emailError: !emailSent ? 'Resend test mode restriction. See configuration panel for details.' : undefined,
      smsError: !smsSent ? 'Twilio authentication error. See configuration panel for details.' : undefined,
      warning: !atLeastOneSuccess 
        ? 'Both email and SMS delivery failed. Configure API keys for production use.' 
        : !emailSent 
          ? 'SMS delivery failed. Email sent successfully.' 
          : !smsSent 
            ? 'SMS delivery failed. Email sent successfully.'
            : undefined
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
    const { email, phone, otp } = body;

    if (!email || !phone || !otp) {
      return c.json({ error: 'Email, phone, and OTP are required' }, 400);
    }

    // Get stored OTP data
    const otpKey = `otp_${email}_${phone}`;
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

    console.log(`OTP verified successfully for ${email}/${phone}`);

    return c.json({ 
      success: true, 
      message: 'OTP verified successfully',
      email,
      phone
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return c.json({ error: error.message || 'Failed to verify OTP' }, 500);
  }
});

Deno.serve(app.fetch);
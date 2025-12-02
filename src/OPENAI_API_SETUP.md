# 🔑 OpenAI API Key Setup Guide

## Quick Setup

The ChatBot requires an OpenAI API key to work. Follow these steps:

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)

### Step 2: Add API Key to Your Project

Create a `.env` file in your project root (same level as `package.json`):

```bash
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** 
- Replace `sk-your-actual-api-key-here` with your real API key
- The file must be named exactly `.env` (not `.env.txt` or anything else)
- Make sure it's in the root directory of your project

### Step 3: Add .env to .gitignore

Create or edit `.gitignore` file and add:

```
.env
.env.local
```

This prevents accidentally committing your API key to version control.

### Step 4: Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### Step 5: Test the ChatBot

1. Open your application
2. Click the chat widget (bottom-right)
3. Ask a question like "What is Serve Spares?"
4. The AI should respond using ChatGPT

---

## Verification

If everything is working:
- ✅ Chat widget opens
- ✅ AI responds intelligently with detailed answers
- ✅ No errors in browser console
- ✅ Registration flow works
- ✅ Console shows: "ChatGPT response received"

If you see "Setup Required" message:
- ❌ Check `.env` file exists in root directory
- ❌ Verify key format: `VITE_OPENAI_API_KEY=sk-...`
- ❌ Restart development server
- ❌ Clear browser cache (Ctrl+Shift+R)

If you see "API Authentication Failed":
- ❌ Check API key is correct
- ❌ Verify key is active on OpenAI platform
- ❌ Ensure billing is set up on OpenAI account

---

## Cost Management

### GPT-4o-mini Pricing:
- **Input**: $0.150 per 1M tokens
- **Output**: $0.600 per 1M tokens

### Estimated Costs:
- Average conversation: ~500 tokens = $0.0005
- 1,000 conversations: ~$0.50
- Very cost-effective for prototypes!

### Cost Control Tips:
1. Set usage limits in OpenAI dashboard
2. Monitor usage in OpenAI dashboard
3. Use rate limiting for production
4. Consider caching common responses

---

## Security Best Practices

### ✅ DO:
- Keep API key secret
- Add `.env` to `.gitignore`
- Rotate keys regularly
- Monitor usage
- Set spending limits

### ❌ DON'T:
- Commit API keys to Git
- Share keys publicly
- Use production key in development
- Leave unlimited spending enabled

---

## Troubleshooting

### Error: "API key not found"
**Solution:** Create `.env` file with `VITE_OPENAI_API_KEY`

### Error: "401 Unauthorized"
**Solution:** Check API key is correct and active

### Error: "429 Rate limit"
**Solution:** Wait or upgrade OpenAI plan

### Error: "Insufficient quota"
**Solution:** Add credits to OpenAI account

### AI not responding intelligently
**Solution:** Check API key, restart server, verify network connection

---

## Alternative: Fallback Mode

If you don't have an API key yet, the chatbot will:
- Show a friendly error message
- Offer to transfer to human agent
- Still allow account registration
- Work with pre-programmed responses

You can test without API key, but responses won't be as intelligent.

---

## Production Deployment

For production, add environment variable to your hosting platform:

### Vercel:
```bash
vercel env add VITE_OPENAI_API_KEY
```

### Netlify:
Site settings → Environment variables → Add variable

### AWS Amplify:
Environment variables → Add variable

### Railway/Render:
Environment → Add variable

---

## Need Help?

- **OpenAI Documentation**: https://platform.openai.com/docs
- **API Status**: https://status.openai.com/
- **Serve Spares Support**: support@servespares.com

---

**Remember:** The API key should be kept secret and never shared publicly!
# 📧 Real Gmail OTP Setup Guide

## ⚠️ IMPORTANT: Setup Required Before Use

The system is now configured for **REAL EMAIL sending**. Development mode has been removed.

### 🔐 Step 1: Get Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select:
   - App: "Mail"
   - Device: "Other (Custom name)"
4. Enter "CityLink" as the app name
5. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### 📝 Step 2: Update .env File

Edit your `.env` file and replace the placeholder:

```bash
# Current (needs replacement):
GMAIL_APP_PASSWORD=REPLACE_WITH_YOUR_GMAIL_APP_PASSWORD

# Change to:
GMAIL_APP_PASSWORD=your_actual_16_char_gmail_app_password
```

### 🔄 Step 3: Restart Server

```bash
taskkill /F /IM node.exe
node server/index.js
```

### 🧪 Step 4: Test the System

1. **Start Frontend**: `npm run dev` (in new terminal)
2. **Try Registration**:
   - Go to http://localhost:5173/register
   - Fill registration form
   - Check your email for OTP code
   - Enter OTP to complete registration

3. **Try Password Reset**:
   - Go to http://localhost:5173/login
   - Click "Forgot Password"
   - Enter your email
   - Check email for OTP
   - Reset password

### 📧 Email Templates

The system sends professional HTML emails:

**Registration Email:**
- Subject: "CityLink - Email Verification OTP"
- Contains 6-digit OTP code
- 10-minute expiry warning

**Password Reset Email:**
- Subject: "CityLink - Password Reset OTP"  
- Contains 6-digit OTP code
- 10-minute expiry warning

### ✅ Success Indicators

**Server Console Shows:**
```
-> ✅ OTP email sent to user@example.com
```

**Email Received:**
- Professional CityLink branded email
- Clear OTP code display
- Expiry information

### 🔍 Troubleshooting

**If emails don't send:**
1. Check Gmail app password is correct (16 characters)
2. Ensure 2-factor authentication is enabled
3. Verify `.env` file has no extra spaces
4. Check server console for error messages

**Current Status:**
- ✅ Backend: Running on http://127.0.0.1:5000
- ✅ MongoDB: Connected
- ✅ Email: Configured for real Gmail sending
- ❌ Frontend: Not started (run `npm run dev`)

**Ready for production use!** 🚀

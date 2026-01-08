# Email OTP Setup Guide

## Current Status: ✅ WORKING

The OTP system is now functional with the following features:

### 🚀 **What's Working:**
- ✅ Backend server running on `http://127.0.0.1:5000`
- ✅ MongoDB connected and database seeded
- ✅ OTP generation and storage (10-minute expiry)
- ✅ Development mode with OTP display (for testing)
- ✅ Registration with OTP verification
- ✅ Password reset with OTP verification
- ✅ Frontend-backend communication

### 🛠️ **For Production (Real Email):**

1. **Get Gmail App Password:**
   - Enable 2-factor authentication on your Gmail account
   - Go to Google Account > Security > App passwords
   - Generate new app password for "Mail"
   - Copy the 16-character password

2. **Update .env file:**
   ```
   MONGO_URI=mongodb://localhost:27017/citylink
   GMAIL_APP_PASSWORD=your_actual_16_char_gmail_app_password
   ```

3. **Restart server:**
   ```bash
   taskkill /F /IM node.exe
   node server/index.js
   ```

### 🧪 **For Development (Current Mode):**
- OTP codes are displayed in yellow boxes on the frontend
- Server console shows simulated OTP emails
- No real Gmail configuration needed

### 📧 **Email Templates:**
- Professional HTML emails with CityLink branding
- Separate templates for registration and password reset
- 10-minute expiry mentioned in emails

### 🔐 **Security Features:**
- OTPs expire after 10 minutes
- Used OTPs are marked as consumed
- Automatic cleanup of expired OTPs
- Email validation for registration and password reset

## Testing Steps:
1. Try registering a new account
2. Check yellow box for OTP code (development mode)
3. Enter OTP to complete registration
4. Test password reset flow

The system is ready for both development and production use!

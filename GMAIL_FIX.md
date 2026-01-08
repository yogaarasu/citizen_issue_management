# 🔐 Gmail App Password Setup Required

## ❌ Current Issue:
Your Gmail app password is **INVALID** or **EXPIRED**.

## 🛠️ Solution: Generate New App Password

### Step 1: Go to Google App Passwords
Visit: https://myaccount.google.com/apppasswords

### Step 2: Generate New Password
1. **Sign in** to your Google account
2. Click **"Select app"** → Choose **"Mail"**
3. Click **"Select device"** → Choose **"Other (Custom name)"**
4. Enter **"CityLink"** as the app name
5. Click **"Generate"**

### Step 3: Update .env File
Replace the current password in your `.env` file:

```bash
# Current (INVALID):
GMAIL_APP_PASSWORD=pcwp begc snvl mfef

# NEW (replace with 16-char code):
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Step 4: Restart Server
```bash
taskkill /F /IM node.exe
node server/index.js
```

## 🔍 What the Error Means:
- **"EAUTH"** = Authentication failed
- **"Missing credentials for PLAIN"** = Invalid password
- Gmail requires **App Passwords** for third-party apps

## ✅ Success Indicators:
After fixing, you should see:
```
✅ Gmail authentication successful!
```

## 📧 Important Notes:
- App passwords are **16 characters** with spaces
- They look like: `abcd efgh ijkl mnop`
- **Regular Gmail password** won't work
- Must enable **2-factor authentication** first

**Generate a new app password and update .env file!**

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
import Issue from './models/Issue.js';
import OTP from './models/OTP.js';
import { sendOTPEmail, generateOTP } from './services/emailService.js';

// Load environment variables from project root
dotenv.config({ path: '.env' });

// Temporary fix for testing
process.env.GMAIL_APP_PASSWORD = 'pcwpbegcsnvlmfef';
process.env.MONGO_URI = 'mongodb://localhost:27017/citylink';

const app = express();

// Robust CORS to allow requests from any local frontend
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
  // Log all requests including OPTIONS to debug CORS
  if (req.method === 'OPTIONS' || req.url !== '/') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// MongoDB Connection with Retry Logic
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citylink';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log('✅ MongoDB Connected Successfully');
    seedSuperAdmin();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('   -> Is MongoDB running? (mongod)');
  }
};
connectDB();

// Seed Super Admin
const seedSuperAdmin = async () => {
  try {
    const SUPER_ADMIN_ID = "SA-998877";
    const exists = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!exists) {
      await User.create({
        id: SUPER_ADMIN_ID,
        name: "System Super Admin",
        email: "admin@citylink.com",
        role: "SUPER_ADMIN",
        password: "admin123", 
        createdAt: Date.now(),
        country: 'India'
      });
      console.log("   -> Super Admin Seeded: admin@citylink.com / admin123");
    }
  } catch (error) {
    console.error("   -> Seeding Error:", error.message);
  }
};

// --- Routes ---

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'CityLink API Running' });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'User not registered' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Security check for Super Admin
    if (user.role === 'SUPER_ADMIN' && user.id !== 'SA-998877') {
         return res.status(403).json({ message: 'Unauthorized Access' });
    }

    console.log(`   -> User logged in: ${email}`);
    res.json(user);
  } catch (error) {
    console.error('   -> Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/auth/check-email', async (req, res) => {
    const { email } = req.body;
    try {
        const exists = await User.exists({ email });
        res.json({ exists: !!exists });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send OTP for registration
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, type } = req.body;
  try {
    // For registration, check if email already exists
    if (type === 'registration') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }
    
    // For password reset, check if email exists
    if (type === 'password_reset') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ message: 'Email not registered' });
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({ email, type });
    
    // Save new OTP
    await OTP.create({
      email,
      otp,
      type,
      expiresAt
    });
    
    // Send email
    const emailResult = await sendOTPEmail(email, otp, type);
    if (!emailResult.success) {
      return res.status(500).json({ message: emailResult.error || 'Failed to send OTP email' });
    }
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('   -> Send OTP Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp, type } = req.body;
  try {
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Mark OTP as used
    await OTP.updateOne({ _id: otpRecord._id }, { isUsed: true });
    
    console.log(`   -> OTP verified successfully for ${email}`);
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('   -> Verify OTP Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOneAndUpdate({ email }, { password: newPassword }, { new: true });
        if(!user) return res.status(404).json({ message: 'User not found' });
        console.log(`   -> Password reset for ${email}`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Users
app.get('/api/users', async (req, res) => {
  const { role } = req.query;
  try {
      const filter = role ? { role } : {};
      const users = await User.find(filter);
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, otp, ...userData } = req.body;
    
    // Verify OTP first
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'registration',
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new OTP.' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "Email already registered" });
    }
    
    // Generate a unique ID for the user
    const generateId = () => {
      return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    // Remove id from userData if it exists, then create new user with generated ID
    const { id: _, ...cleanUserData } = userData;
    const newUser = await User.create({ 
      id: generateId(),
      email, 
      ...cleanUserData 
    });
    
    // Mark OTP as used
    await OTP.updateOne({ _id: otpRecord._id }, { isUsed: true });
    
    console.log(`   -> New user registered: ${newUser.email}`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('   -> Registration Error:', error);
    res.status(400).json({ message: error.message || "Registration failed" });
  }
});

// Admin user creation (no OTP required)
app.post('/api/admin/users', async (req, res) => {
  try {
    const { email, ...userData } = req.body;
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "Email already registered" });
    }
    
    // Create admin user with provided ID or generate one
    const { id, ...cleanUserData } = userData;
    const newUser = await User.create({ 
      id: id || 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email, 
      ...cleanUserData 
    });
    
    console.log(`   -> New admin user created: ${newUser.email} (${newUser.role})`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('   -> Admin Creation Error:', error);
    res.status(400).json({ message: error.message || "Admin creation failed" });
  }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updated = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await User.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ message: "User not found" });
    console.log(`   -> User deleted: ${req.params.id}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issues
app.get('/api/issues', async (req, res) => {
  const { city, authorId } = req.query;
  try {
      let filter = {};
      if (city) filter.city = new RegExp(`^${city}$`, 'i'); // Exact match, case insensitive
      if (authorId) filter.authorId = authorId;
      
      const issues = await Issue.find(filter).sort({ createdAt: -1 });
      res.json(issues);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const newIssue = await Issue.create(req.body);
    console.log(`   -> New issue reported: ${newIssue.title}`);
    res.status(201).json(newIssue);
  } catch (error) {
    console.error('   -> Issue Create Error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/issues/:id', async (req, res) => {
    try {
        const updated = await Issue.findOneAndUpdate(
            { id: req.params.id }, 
            { ...req.body, updatedAt: Date.now() }, 
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://127.0.0.1:${PORT}`);
    console.log(`   -> Health check: http://127.0.0.1:${PORT}/`);
    console.log(`   -> Waiting for Frontend requests...`);
});
import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const createTransporter = () => {
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailPassword || gmailPassword === 'REPLACE_WITH_YOUR_GMAIL_APP_PASSWORD') {
    console.error('❌ Gmail app password not configured. Please set GMAIL_APP_PASSWORD in .env file');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yogaarasu465@gmail.com',
      pass: gmailPassword
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Gmail not configured. Please check GMAIL_APP_PASSWORD in .env file');
  }

  const subject = type === 'registration' 
    ? 'CityLink - Email Verification OTP'
    : 'CityLink - Password Reset OTP';
  
  const html = type === 'registration'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to CityLink!</h2>
        <p>Thank you for registering with CityLink. To complete your registration, please use the following OTP:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 5px;">${otp}</span>
        </div>
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Best regards,<br>CityLink Team</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">CityLink Password Reset</h2>
        <p>You requested to reset your password. Use the following OTP to proceed:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 5px;">${otp}</span>
        </div>
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Best regards,<br>CityLink Team</p>
      </div>
    `;

  const mailOptions = {
    from: 'yogaarasu465@gmail.com',
    to: email,
    subject: subject,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`   -> ✅ OTP email sent to ${email}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error('   -> ❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};

export { generateOTP };

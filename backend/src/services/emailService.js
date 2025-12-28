const transporter = require('../config/email');

class EmailService {
  static async sendOTP(email, otp) {
    if (!transporter) {
      console.error('Email transporter not initialized');
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USERNAME || 'noreply@examproctoring.com',
      to: email,
      subject: 'Your OTP for Student Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Exam Proctoring System</h2>
          <p>Your OTP for registration is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 10px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} Exam Proctoring System. All rights reserved.</p>
        </div>
      `,
    };

    try {
      // Set a timeout for email sending (15 seconds max)
      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timeout')), 15000);
      });
      
      await Promise.race([emailPromise, timeoutPromise]);
      console.log('OTP email sent successfully to:', email);
      return true;
    } catch (error) {
      // Log error but don't throw - email is non-critical
      // OTP is already saved in database, so user can still verify
      console.error('Email sending error (non-blocking):', error.message);
      console.error('Email error details:', {
        message: error.message,
        code: error.code,
        command: error.command
      });
      // Return false instead of throwing - allows graceful degradation
      return false;
    }
  }

  static async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Exam Proctoring System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Exam Proctoring System!</h2>
          <p>Dear ${firstName},</p>
          <p>Your account has been successfully created. You can now login and start using our platform.</p>
          <p>Features you can access:</p>
          <ul>
            <li>Take online exams</li>
            <li>View your results</li>
            <li>Track your progress</li>
            <li>Access study materials</li>
          </ul>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Exam Proctoring Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      return false;
    }
  }

  static async sendPasswordResetOTP(email, otp, userType = 'student') {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP - Exam Proctoring System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You have requested to reset your password. Use the OTP below to verify your identity:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 10px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} Exam Proctoring System. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Password reset OTP email error:', error);
      return false;
    }
  }
}

module.exports = EmailService;
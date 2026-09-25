const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend'); 

const router = express.Router();

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});
const prisma = new PrismaClient({ adapter });

const resend = new Resend(process.env.RESEND_API_KEY);

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const normalizedRole = role || 'USER';
    const hashedPassword = await bcrypt.hash(password, 8);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizedRole,
        isVerified: normalizedRole === 'ADMIN',
      },
    });

    if (normalizedRole === 'LAWYER') {
      await prisma.lawyerProfile.create({
        data: {
          userId: user.id,
          specialization: "General", 
          experience: 0,
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        strikes: user.strikes
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    res.status(500).json({ error: "Server error during registration" });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified, 
        strikes: user.strikes        
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// FORGOT PASSWORD ROUTE (API APPROACH)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: email, 
      subject: "Password Reset Request - CaseRoute",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>CaseRoute Password Reset</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 12px;">The link expires in 1 hour.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(500).json({ error: "Failed to send API email" });
    }

    res.status(200).json({ message: "Password reset link sent to your email" });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error during forgot password" });
  }
});

// RESET PASSWORD ROUTE
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), 
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token. Please request a new link." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Password has been reset successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

module.exports = router;
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Added for secure token generation

const router = express.Router();

// 1. Initialize the adapter with your database URL (Restored)
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Pass the adapter into the Prisma Client (Restored)
const prisma = new PrismaClient({ adapter });

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

    // CRITICAL: If the user is a lawyer, create the profile immediately
    if (normalizedRole === 'LAWYER') {
      await prisma.lawyerProfile.create({
        data: {
          userId: user.id,
          specialization: "General", // Default value to prevent 500 error
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

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // EXPLICITLY include the new fields in the response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified, // CRITICAL: This enables the frontend check
        strikes: user.strikes        // Optional: Good for showing warnings
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// RESET PASSWORD ROUTE (Verify Token & Save New Password)
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 1. Find user with this token and check if it's not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token ki expiry time abhi ke time se zyada honi chahiye
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token. Please request a new link." });
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // 3. Update password and remove the token from database so it can't be reused
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
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER', // Ensure this matches your Prisma Enum
        isVerified: role === 'ADMIN' ? true : false, // Admins auto-verified
      },
    });

    // CRITICAL: If the user is a lawyer, create the profile immediately
    if (role === 'LAWYER') {
      await prisma.lawyerProfile.create({
        data: {
          userId: user.id,
          specialization: "General", // Default value to prevent 500 error
          experience: 0,
        }
      });
    }

    res.json({ message: "Registration successful!", user });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// LOGIN ROUTE
// Inside your login route (POST /api/auth/login)
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

module.exports = router;
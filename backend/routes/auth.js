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
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to database with normalized role
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role ? role.toUpperCase() : 'USER', 
      },
    });

    res.status(201).json({ 
      message: "User registered successfully!", 
      user: { id: newUser.id, role: newUser.role } 
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
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
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;
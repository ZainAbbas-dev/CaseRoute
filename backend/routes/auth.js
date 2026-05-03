const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const prisma = new PrismaClient();

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // 2. Hash the password
    // Using bcryptjs to ensure compatibility across Vercel and Render
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save to database
    // We force role to uppercase to match your logic: 'USER', 'LAWYER', 'ADMIN'
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

    // 1. Find user (normalized email)
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 3. Generate JWT Token
    // Including the role in the token allows the frontend to decode it for routing
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 4. Send Response
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
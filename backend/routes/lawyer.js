const express = require('express');
const router = express.Router();
const prisma = require('../db'); // Required to access your database

// PUT: Lawyer Profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { specialization, experience, location, profileImage } = req.body;

    const profile = await prisma.lawyerProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        specialization,
        experience: parseInt(experience),
        location,
        profileImage, // Save the Base64 string
      },
      create: {
        userId: parseInt(userId),
        specialization,
        experience: parseInt(experience),
        location,
        profileImage,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router; // Required to let index.js use this file
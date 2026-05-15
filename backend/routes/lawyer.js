const express = require('express');
const router = express.Router();
const prisma = require('../db'); // Ensures the database connection is available

// PUT: Update Lawyer Professional Profile
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
        profileImage, // Stores the Base64 image string
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

module.exports = router; 
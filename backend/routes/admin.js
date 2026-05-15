const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/stats', async (req, res) => {
  try {
    // Correctly count real-time data from the database
    const [totalUsers, totalCases, pendingCount, assignedCount] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.case.count({ where: { status: 'PENDING' } }),
      prisma.case.count({ where: { status: 'ASSIGNED' } })
    ]);

    const lawyers = await prisma.user.findMany({
      where: { role: 'LAWYER' },
      include: { lawyerProfile: true }
    });

    res.json({
      stats: { totalUsers, totalCases, pendingCases: pendingCount, assignedCases: assignedCount },
      lawyers
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// Add this to backend/routes/admin.js

router.get('/stalled-cases', async (req, res) => {
  try {
    // Find cases that are ASSIGNED but have NO messages
    const stalledCases = await prisma.case.findMany({
      where: {
        status: 'ASSIGNED',
        messages: {
          none: {}, // Logic: The case has zero messages
        },
      },
      include: {
        user: { select: { name: true, email: true } },
        lawyer: { select: { name: true, email: true } },
      },
      orderBy: {
        updatedAt: 'asc', // Show the oldest stalled cases first
      },
    });

    res.json(stalledCases);
  } catch (error) {
    console.error("Error fetching stalled cases:", error);
    res.status(500).json({ error: "Failed to fetch stalled cases" });
  }
});

// ACTION: Re-open a stalled case to the marketplace
router.put('/cases/:id/reopen', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.case.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PENDING',
        lawyerId: null, // Remove the inactive lawyer
      },
    });
    res.json({ message: "Case returned to marketplace successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to re-open case" });
  }
});

// PUT: Issue a Strike to a Lawyer
router.put('/lawyer/:id/strike', async (req, res) => {
  try {
    const lawyer = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { strikes: { increment: 1 } }
    });

    // Auto-ban logic: if strikes reach 3, set account to inactive or banned
    if (lawyer.strikes >= 3) {
      await prisma.user.update({
        where: { id: lawyer.id },
        data: { isBanned: true }
      });
      return res.json({ message: "Lawyer reached 3 strikes and has been banned." });
    }

    res.json({ message: "Strike issued.", totalStrikes: lawyer.strikes });
  } catch (error) {
    res.status(500).json({ error: "Failed to issue strike" });
  }
});

// PUT: Verify Lawyer Documents
router.put('/lawyer/:id/verify', async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isVerified: true }
    });
    res.json({ message: "Lawyer verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// GET: Fetch lawyers waiting for verification
router.get('/verification-queue', async (req, res) => {
  try {
    const queue = await prisma.user.findMany({
      where: {
        role: 'LAWYER',
        isVerified: false,
        // Only show those who have actually uploaded a profile/ID
        lawyerProfile: { isNot: null } 
      },
      include: { lawyerProfile: true }
    });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verification queue" });
  }
});

// PUT: Approve Lawyer (Verify)
router.put('/lawyer/:id/verify', async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isVerified: true }
    });
    res.json({ message: "Lawyer verified! They can now accept marketplace cases." });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify lawyer" });
  }
});
module.exports = router;
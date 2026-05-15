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

module.exports = router;
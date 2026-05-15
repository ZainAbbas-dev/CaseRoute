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

module.exports = router;
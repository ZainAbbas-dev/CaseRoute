const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET: System-wide analytics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalCases = await prisma.case.count();
    const pendingCases = await prisma.case.count({ where: { status: 'PENDING' } });
    const assignedCases = await prisma.case.count({ where: { status: 'ASSIGNED' } });

    // Fetch all lawyers with their profile details
    const lawyers = await prisma.user.findMany({
      where: { role: 'LAWYER' },
      include: { lawyerProfile: true }
    });

    res.json({
      stats: { totalUsers, totalCases, pendingCases, assignedCases },
      lawyers
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

module.exports = router;
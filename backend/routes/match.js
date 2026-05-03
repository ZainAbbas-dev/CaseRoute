const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// GET: Generate algorithmic matches for a specific case
router.get('/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;

    // 1. Fetch the target case
    const targetCase = await prisma.case.findUnique({
      where: { id: parseInt(caseId) }
    });

    if (!targetCase) return res.status(404).json({ error: "Case not found" });

    // 2. Fetch all lawyers who have set up a profile
    const lawyers = await prisma.user.findMany({
      where: { role: 'LAWYER' },
      include: { lawyerProfile: true }
    });

    // 3. The Scoring Algorithm
    const scoredLawyers = lawyers
      .filter(lawyer => lawyer.lawyerProfile) // Ensure they have a profile
      .map(lawyer => {
        const profile = lawyer.lawyerProfile;
        
        let score = 0;
        
        // Weight 1: Exact Specialization Match (+50 points)
        if (profile.specialization.toLowerCase() === targetCase.category?.toLowerCase()) {
          score += 50;
        }

        // Weight 2: Experience (+2 points per year)
        score += (profile.experience * 2);

        // Weight 3: Rating (+5 points per rating star)
        score += (profile.rating * 5);

        return {
          lawyerId: lawyer.id,
          name: lawyer.name,
          specialization: profile.specialization,
          experience: profile.experience,
          rating: profile.rating,
          location: profile.location,
          matchScore: score
        };
      });

    // 4. Sort descending by score and grab the Top 3
    const topMatches = scoredLawyers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    res.status(200).json(topMatches);
  } catch (error) {
    console.error("Algorithm Error:", error);
    res.status(500).json({ error: "Failed to calculate matches" });
  }
});

module.exports = router;
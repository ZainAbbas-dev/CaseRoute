const express = require('express');
const router = express.Router();
// Use the single instance we created in db.js to avoid 'undefined' errors
const prisma = require('../db'); 



// POST: Create a new case with MOCK AI Structuring
router.post('/', async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiData = {
      category: "Civil Dispute", 
      urgency: "HIGH"            
    };

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        category: aiData.category,
        urgency: aiData.urgency,
        userId: parseInt(userId)
      }
    });

    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ error: "Failed to create case" });
  }
});

// GET: Fetch all PENDING cases
router.get('/pending', async (req, res) => {
  try {
    const pendingCases = await prisma.case.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(pendingCases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending cases" });
  }
});

// PUT: Assign a case to a lawyer
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { lawyerId } = req.body;

    const updatedCase = await prisma.case.update({
      where: { id: parseInt(id) },
      data: {
        lawyerId: parseInt(lawyerId),
        status: 'ASSIGNED'
      }
    });

    res.status(200).json(updatedCase);
  } catch (error) {
    res.status(500).json({ error: "Failed to assign case" });
  }
});

// GET: Fetch all cases for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userCases = await prisma.case.findMany({
      where: { userId: parseInt(req.params.userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(userCases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user cases" });
  }
});

// GET: Fetch a single case by ID (Updated to include lawyer profile data)
router.get('/single/:id', async (req, res) => {
  try {
    const singleCase = await prisma.case.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        lawyer: { 
          include: { lawyerProfile: true } 
        } 
      }
    });
    if (!singleCase) return res.status(404).json({ error: "Case not found" });
    res.status(200).json(singleCase);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch case" });
  }
});

// GET: Fetch all cases for a specific lawyer
router.get('/single/lawyer/:lawyerId', async (req, res) => {
  try {
    const activeCases = await prisma.case.findMany({
      where: { lawyerId: parseInt(req.params.lawyerId) },
      include: { user: { select: { name: true } } }
    });
    res.json(activeCases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lawyer cases" });
  }
});

// --- DOCUMENT VAULT ROUTES ---

// POST: Upload a document
router.post('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, fileType, fileData, userId } = req.body;
    const document = await prisma.document.create({
      data: {
        fileName, fileType, fileData,
        caseId: parseInt(id),
        uploadedBy: parseInt(userId)
      }
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload" });
  }
});

// GET: Fetch document list (No heavy data)
router.get('/:id/documents', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { caseId: parseInt(req.params.id) },
      select: { id: true, fileName: true, fileType: true, createdAt: true }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document list" });
  }
});

// ADDED: Fetch single document data (For downloading/viewing)
router.get('/documents/view/:docId', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: parseInt(req.params.docId) }
    });
    if (!doc) return res.status(404).json({ error: "File not found" });
    res.json({ fileData: doc.fileData, fileType: doc.fileType, fileName: doc.fileName });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve file content" });
  }
});

// ADDED: Delete document
router.delete('/documents/:docId', async (req, res) => {
  try {
    await prisma.document.delete({
      where: { id: parseInt(req.params.docId) }
    });
    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

module.exports = router;
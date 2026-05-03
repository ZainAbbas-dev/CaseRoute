require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const prisma = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use(cors());

// INCREASED LIMITS FOR DOCUMENT UPLOADS
// Using 50mb to accommodate high-res images and large PDFs converted to Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_case_room', (caseId) => {
    socket.join(`case_${caseId}`);
  });

  socket.on('send_message', async (data) => {
    const { caseId, senderId, text } = data;
    try {
      const savedMessage = await prisma.message.create({
        data: {
          text,
          senderId: parseInt(senderId),
          caseId: parseInt(caseId)
        },
        include: { sender: { select: { name: true, role: true } } }
      });

      io.to(`case_${caseId}`).emit('receive_message', savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

// History Endpoint
app.get('/api/messages/:caseId', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { caseId: parseInt(req.params.caseId) },
      include: { sender: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/match', require('./routes/match'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
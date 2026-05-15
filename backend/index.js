require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const prisma = require('./db');

const app = express();
const server = http.createServer(app);

// UPDATED SOCKET.IO CORS
// Allowing both local development and your live Vercel frontend
const io = new Server(server, {
  cors: { 
    origin: [
      "http://localhost:3000", 
      "https://case-route.vercel.app" // Ensure this matches your ACTUAL Vercel URL
    ], 
    methods: ["GET", "POST"] 
  }
});

// Standard Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Socket.io Real-time Chat Logic ---
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // When a user opens a chat, they join a room specific to that case
  socket.on('join_case_room', (caseId) => {
    socket.join(`case_${caseId}`);
    console.log(`Socket ${socket.id} joined room: case_${caseId}`);
  });

  socket.on('send_message', async (data) => {
    const { caseId, senderId, text } = data;
    try {
      // Save message to Database
      const savedMessage = await prisma.message.create({
        data: {
          text,
          senderId: parseInt(senderId),
          caseId: parseInt(caseId)
        },
        include: { 
          sender: { 
            select: { name: true, role: true } 
          } 
        }
      });

      // Broadcast to everyone in the room (Lawyer and Client)
      io.to(`case_${caseId}`).emit('receive_message', savedMessage);
    } catch (error) {
      console.error("Error saving/sending message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket');
  });
});

// --- REST API Endpoints ---

// Chat History Endpoint
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

// Standard Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/match', require('./routes/match'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/lawyer', require('./routes/lawyer')); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
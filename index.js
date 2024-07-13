const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messages');
const mongoose = require('mongoose');
const socket = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('DB Connection Successful');
  })
  .catch((err) => {
    console.error('DB Connection Error:', err.message);
  });

// Start the server
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
});

// Socket.IO setup
const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on('connection', (socket) => {
  console.log('New client connected');
  global.chatSocket = socket;

  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieve', data.msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
  });
});

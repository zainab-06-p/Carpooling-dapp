const Message = require('./Schema/MessageModel');
const { ConnectToMongo } = require('./db');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS and Socket.IO
const allowedOrigins = [
  'https://carpooling-frontend.vercel.app',
  'http://localhost:3000', // For local development
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
};

app.use(express.json());
app.use(cors(corsOptions));

// Connect to MongoDB
(async () => {
  await ConnectToMongo();
})();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

const userList = {};

// API to save messages
app.post('/messages', async (req, res) => {
  try {
    const { room, author, message, time } = req.body;

    const newMessage = new Message({
      room,
      author,
      message,
      time,
      createdAt: new Date(), // Ensure createdAt for TTL
    });

    await newMessage.save();

    io.to(room).emit('receive_message', newMessage);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false, error: 'Failed to save message' });
  }
});

// API to retrieve chat history
app.get('/messages/:room', async (req, res) => {
  try {
    const { room } = req.params;
    const history = await Message.find({ room });

    res.status(200).json(history);
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });

  socket.on('join_room', (data) => {
    socket.join(data.room);
    socket.username = data.username;
    userList[data.room] = userList[data.room] || [];
    if (!userList[data.room].includes(data.username)) {
      userList[data.room].push(data.username);
    }
    console.log(`User ${data.username} (ID: ${socket.id}) joined room ${data.room}`);

    socket.to(data.room).emit('user_entered', data.username);
    io.to(data.room).emit('users_in_room', userList[data.room]);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);

    Object.keys(userList).forEach((room) => {
      const index = userList[room].indexOf(socket.username);
      if (index !== -1) {
        userList[room].splice(index, 1);
        io.to(room).emit('users_in_room', userList[room]);
        if (userList[room].length === 0) {
          delete userList[room]; // Clean up empty rooms
        }
      }
    });
  });
});

// Start server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
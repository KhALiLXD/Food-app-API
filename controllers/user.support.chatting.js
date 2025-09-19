// socket-manager.js
const { Server } = require('socket.io');

const chatHistory = {}; // A simple in-memory store for chat history

const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific chat room
    socket.on('join_chat', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their chat room.`);
      if (chatHistory[userId]) {
        socket.emit('chat_history', chatHistory[userId]);
      }
    });

    // Handle incoming messages
    socket.on('send_message', (data) => {
      const { userId, message } = data;
      console.log(`Message from ${userId}: ${message}`);

      if (!chatHistory[userId]) {
        chatHistory[userId] = [];
      }
      const messageData = { from: 'user', text: message, timestamp: new Date() };
      chatHistory[userId].push(messageData);

      // Emit to the user and the support agent
      io.to(userId).emit('receive_message', messageData); 
      // In a real app, you would route to the correct support agent's room
      io.to('support-agents-room').emit('receive_message', { userId, messageData }); 
    });

    // Handle typing events
    socket.on('typing', (userId) => {
      io.to('support-agents-room').emit('typing', userId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocketIO;
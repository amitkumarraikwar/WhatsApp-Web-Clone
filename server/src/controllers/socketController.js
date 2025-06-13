import User from '../models/User.js';
import Chat from '../models/Chat.js';

const activeUsers = new Map();
const typingUsers = new Map();

export const handleSocketConnection = (io, socket) => {
  const userId = socket.userId;
  const user = socket.user;

  console.log(`👤 User ${user.username} connected with socket ${socket.id}`);

  // Store user's socket ID and mark as online
  activeUsers.set(userId, socket.id);
  updateUserOnlineStatus(userId, true, socket.id);

  // Join user to their own room for direct messaging
  socket.join(userId);

  // Notify other users that this user is online
  socket.broadcast.emit('user.online', {
    userId,
    username: user.username,
    isOnline: true
  });

  // Handle typing events
  socket.on('typing.start', ({ chatId }) => {
    const typingKey = `${chatId}-${userId}`;
    
    if (!typingUsers.has(typingKey)) {
      typingUsers.set(typingKey, {
        userId,
        username: user.username,
        chatId
      });

      // Notify other participants in the chat
      socket.to(chatId).emit('user.typing', {
        userId,
        username: user.username,
        chatId
      });
    }
  });

  socket.on('typing.stop', ({ chatId }) => {
    const typingKey = `${chatId}-${userId}`;
    
    if (typingUsers.has(typingKey)) {
      typingUsers.delete(typingKey);
      
      socket.to(chatId).emit('user.stopTyping', {
        userId,
        chatId
      });
    }
  });

  // Handle joining chat rooms
  socket.on('chat.join', async ({ chatId }) => {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });

      if (chat) {
        socket.join(chatId);
        console.log(`User ${user.username} joined chat ${chatId}`);
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  });

  // Handle leaving chat rooms
  socket.on('chat.leave', ({ chatId }) => {
    socket.leave(chatId);
    
    // Clear any typing indicators for this user in this chat
    const typingKey = `${chatId}-${userId}`;
    if (typingUsers.has(typingKey)) {
      typingUsers.delete(typingKey);
      socket.to(chatId).emit('user.stopTyping', {
        userId,
        chatId
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👤 User ${user.username} disconnected`);

    activeUsers.delete(userId);
    updateUserOnlineStatus(userId, false);

    // Clear all typing indicators for this user
    for (const [key, value] of typingUsers.entries()) {
      if (value.userId === userId) {
        typingUsers.delete(key);
        socket.to(value.chatId).emit('user.stopTyping', {
          userId,
          chatId: value.chatId
        });
      }
    }

    // Notify other users that this user is offline
    socket.broadcast.emit('user.offline', {
      userId,
      username: user.username,
      isOnline: false,
      lastSeen: new Date()
    });
  });
};

const updateUserOnlineStatus = async (userId, isOnline, socketId = null) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date(),
      socketId
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

// Helper function to get online users
export const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};
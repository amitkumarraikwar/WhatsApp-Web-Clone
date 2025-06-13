import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { validationResult } from 'express-validator';
import { io } from '../index.js';

export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Verify chat exists and user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: senderId
    }).populate('participants', 'username socketId');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      chat: chatId,
      content,
      messageType
    });

    await message.save();

    // Update chat's last message and activity
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    await chat.save();

    // Populate message with sender info
    await message.populate('sender', 'username avatar');

    // Mark as delivered to online participants
    const onlineParticipants = chat.participants.filter(
      participant => participant.socketId && participant._id.toString() !== senderId.toString()
    );

    onlineParticipants.forEach(participant => {
      message.markAsDelivered(participant._id);
      
      // Emit to participant's socket
      if (participant.socketId) {
        io.to(participant.socketId).emit('message.receive', {
          message,
          chatId
        });
      }
    });

    await message.save();

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user._id;

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: currentUserId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    const unreadMessages = messages.filter(message => 
      message.sender._id.toString() !== currentUserId.toString() &&
      !message.readBy.some(read => read.user.toString() === currentUserId.toString())
    );

    for (const message of unreadMessages) {
      await message.markAsRead(currentUserId);
    }

    res.json({ 
      messages: messages.reverse(),
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markAsRead(currentUserId);

    // Notify sender that message was read
    const chat = await Chat.findById(message.chat).populate('participants', 'socketId');
    const sender = chat.participants.find(p => p._id.toString() === message.sender.toString());
    
    if (sender && sender.socketId) {
      io.to(sender.socketId).emit('message.read', {
        messageId,
        readBy: currentUserId,
        chatId: message.chat
      });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
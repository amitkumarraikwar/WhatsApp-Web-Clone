import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { validationResult } from 'express-validator';

export const createChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participantId } = req.body;
    const currentUserId = req.user._id;

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [currentUserId, participantId] }
    }).populate('participants', 'username email avatar isOnline lastSeen');

    if (existingChat) {
      return res.json({ chat: existingChat });
    }

    // Create new chat
    const newChat = new Chat({
      participants: [currentUserId, participantId],
      isGroupChat: false
    });

    await newChat.save();

    const chat = await Chat.findById(newChat._id)
      .populate('participants', 'username email avatar isOnline lastSeen')
      .populate('lastMessage');

    res.status(201).json({ chat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({
      participants: currentUserId
    })
      .populate('participants', 'username email avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .sort({ lastActivity: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: currentUserId
    })
      .populate('participants', 'username email avatar isOnline lastSeen')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    // Mark all unread messages in this chat as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: currentUserId },
        'readBy.user': { $ne: currentUserId }
      },
      {
        $push: { readBy: { user: currentUserId, readAt: new Date() } }
      }
    );

    res.json({ message: 'Chat marked as read' });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
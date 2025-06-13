import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import WelcomeScreen from '../components/WelcomeScreen';
import { Chat } from '../types';
import { chatService } from '../services/chatService';
import toast from 'react-hot-toast';

const ChatPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message.receive', ({ message, chatId }) => {
        // Update the chat's last message
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, lastMessage: message, lastActivity: message.createdAt }
            : chat
        ));

        // Show notification if chat is not currently selected
        if (!selectedChat || selectedChat._id !== chatId) {
          toast.success(`New message from ${message.sender.username}`);
        }
      });

      return () => {
        socket.off('message.receive');
      };
    }
  }, [socket, selectedChat]);

  const loadChats = async () => {
    try {
      const fetchedChats = await chatService.getChats();
      setChats(fetchedChats);
    } catch (error: any) {
      toast.error('Failed to load chats');
      console.error('Load chats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    
    // Join chat room for real-time updates
    if (socket) {
      socket.emit('chat.join', { chatId: chat._id });
    }
  };

  const handleChatCreate = async (participantId: string) => {
    try {
      const newChat = await chatService.createChat(participantId);
      
      // Check if chat already exists in the list
      const existingChatIndex = chats.findIndex(chat => chat._id === newChat._id);
      
      if (existingChatIndex === -1) {
        setChats(prev => [newChat, ...prev]);
      }
      
      setSelectedChat(newChat);
      toast.success('Chat created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create chat');
    }
  };

  const updateChatLastMessage = (chatId: string, message: any) => {
    setChats(prev => prev.map(chat => 
      chat._id === chatId 
        ? { ...chat, lastMessage: message, lastActivity: message.createdAt }
        : chat
    ));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200">
        <Sidebar
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          onChatCreate={handleChatCreate}
          isConnected={isConnected}
        />
      </div>
      
      <div className="hidden md:flex flex-1">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            onMessageSent={updateChatLastMessage}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Mobile chat window overlay */}
      {selectedChat && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <ChatWindow
            chat={selectedChat}
            onMessageSent={updateChatLastMessage}
            onBack={() => setSelectedChat(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
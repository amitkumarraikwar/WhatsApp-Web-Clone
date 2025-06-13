import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Smile } from 'lucide-react';
import { Chat, Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services/chatService';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import TypingIndicator from './TypingIndicator';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  chat: Chat;
  onMessageSent: (chatId: string, message: Message) => void;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onMessageSent, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const { socket, typingUsers } = useSocket();

  const otherParticipant = chat.participants.find(p => p._id !== user?._id);
  const chatTypingUsers = typingUsers[chat._id] || [];

  useEffect(() => {
    loadMessages();
    
    // Mark chat as read when opening
    chatService.markChatAsRead(chat._id).catch(console.error);
  }, [chat._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const handleMessageReceive = ({ message, chatId }: { message: Message; chatId: string }) => {
        if (chatId === chat._id) {
          setMessages(prev => [...prev, message]);
          // Mark as read immediately since chat is open
          chatService.markMessageAsRead(message._id).catch(console.error);
        }
      };

      const handleMessageRead = ({ messageId }: { messageId: string }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...msg.readBy, { user: user!._id, readAt: new Date().toISOString() }] }
            : msg
        ));
      };

      socket.on('message.receive', handleMessageReceive);
      socket.on('message.read', handleMessageRead);

      return () => {
        socket.off('message.receive', handleMessageReceive);
        socket.off('message.read', handleMessageRead);
      };
    }
  }, [socket, chat._id, user?._id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { messages } = await chatService.getMessages(chat._id);
      setMessages(messages);
    } catch (error: any) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    handleStopTyping();

    try {
      const message = await chatService.sendMessage(chat._id, messageContent);
      setMessages(prev => [...prev, message]);
      onMessageSent(chat._id, message);
    } catch (error: any) {
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (socket && value.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit('typing.start', { chatId: chat._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (socket && isTyping) {
      setIsTyping(false);
      socket.emit('typing.stop', { chatId: chat._id });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender._id === user?._id) {
      const otherParticipantId = otherParticipant?._id;
      if (message.readBy.some(read => read.user === otherParticipantId)) {
        return 'read';
      }
      if (message.deliveredTo.some(delivery => delivery.user === otherParticipantId)) {
        return 'delivered';
      }
      return 'sent';
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <Avatar user={otherParticipant!} size="md" />
              {otherParticipant?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {otherParticipant?.username || 'Unknown User'}
              </h2>
              <p className="text-sm text-gray-600">
                {otherParticipant?.isOnline ? (
                  'Online'
                ) : otherParticipant?.lastSeen ? (
                  `Last seen ${format(new Date(otherParticipant.lastSeen), 'HH:mm')}`
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDateHeader = index === 0 || 
                format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd') !== 
                format(new Date(message.createdAt), 'yyyy-MM-dd');

              return (
                <React.Fragment key={message._id}>
                  {showDateHeader && (
                    <div className="flex justify-center py-2">
                      <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                        {format(new Date(message.createdAt), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={message.sender._id === user?._id}
                    status={getMessageStatus(message)}
                  />
                </React.Fragment>
              );
            })}
            
            {chatTypingUsers.length > 0 && (
              <TypingIndicator users={chatTypingUsers} />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={sending}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
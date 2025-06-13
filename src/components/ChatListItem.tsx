import React from 'react';
import { Chat } from '../types';
import Avatar from './Avatar';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  currentUserId,
  isSelected,
  onClick,
}) => {
  const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MM/dd/yyyy');
    }
  };

  const getLastMessagePreview = () => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const isOwnMessage = chat.lastMessage.sender._id === currentUserId;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    return `${prefix}${chat.lastMessage.content}`;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-all duration-200 ${
        isSelected 
          ? 'bg-green-50 border-l-green-500' 
          : 'border-l-transparent'
      }`}
    >
      <div className="relative">
        <Avatar user={otherParticipant!} size="md" />
        {otherParticipant?.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {otherParticipant?.username || 'Unknown User'}
          </h3>
          <span className="text-xs text-gray-500">
            {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 truncate">
          {getLastMessagePreview()}
        </p>
        
        {!otherParticipant?.isOnline && otherParticipant?.lastSeen && (
          <p className="text-xs text-gray-400 mt-1">
            Last seen {formatTime(otherParticipant.lastSeen)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
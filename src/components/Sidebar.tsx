import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle, Settings, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { Chat, User } from '../types';
import Avatar from './Avatar';
import ChatListItem from './ChatListItem';
import UserSearchModal from './UserSearchModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onChatCreate: (participantId: string) => void;
  isConnected: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  onChatCreate,
  isConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { user, logout } = useAuth();

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleLogout = async () => {
    try {
      await chatService.markChatAsRead; // This should be authService.logout()
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      logout(); // Force logout on error
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar user={user!} size="md" />
            <div>
              <h2 className="font-semibold text-gray-900">{user?.username}</h2>
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
              title="Start new chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No chats yet</h3>
            <p className="text-center text-sm">
              {searchTerm ? 'No chats match your search' : 'Start a conversation by clicking the + button'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              currentUserId={user!._id}
              isSelected={selectedChat?._id === chat._id}
              onClick={() => onChatSelect(chat)}
            />
          ))
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearchModal
          onClose={() => setShowUserSearch(false)}
          onChatCreate={onChatCreate}
        />
      )}
    </div>
  );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { chatService } from '../services/chatService';
import { User } from '../types';
import Avatar from './Avatar';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface UserSearchModalProps {
  onClose: () => void;
  onChatCreate: (participantId: string) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ onClose, onChatCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers(searchTerm);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async (query: string) => {
    setLoading(true);
    try {
      const foundUsers = await chatService.getUsers(query);
      setUsers(foundUsers);
    } catch (error: any) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (participantId: string) => {
    setSelectedUserId(participantId);
    try {
      await onChatCreate(participantId);
      onClose();
    } catch (error) {
      setSelectedUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Start New Chat</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              {searchTerm ? 'No users found' : 'Type to search for users'}
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleCreateChat(user._id)}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Avatar user={user} size="md" />
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-900">{user.username}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.bio && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.bio}</p>
                  )}
                </div>
                {selectedUserId === user._id && (
                  <LoadingSpinner size="sm" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
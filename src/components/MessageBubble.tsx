import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../types';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read' | null;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, status }) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const getStatusIcon = () => {
    if (!status) return null;

    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isOwn
            ? 'bg-green-500 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div className={`flex items-center justify-end space-x-1 mt-1 ${
          isOwn ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && getStatusIcon()}
          {message.edited && (
            <span className="text-xs italic">edited</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
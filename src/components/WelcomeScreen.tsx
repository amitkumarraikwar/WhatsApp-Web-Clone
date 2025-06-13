import React from 'react';
import { MessageCircle, Users, Shield, Zap } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <MessageCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to WhatsApp Web
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Send and receive messages without keeping your phone online. 
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Connect with Friends</h3>
              <p className="text-sm text-gray-600">Start conversations with anyone</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Secure Messaging</h3>
              <p className="text-sm text-gray-600">End-to-end encryption for privacy</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
              <p className="text-sm text-gray-600">Instant message delivery and read receipts</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Select a chat to start messaging or click the + button to start a new conversation.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
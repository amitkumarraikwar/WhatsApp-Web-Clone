import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message, Chat } from '../types';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  typingUsers: { [chatId: string]: string[] };
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const newSocket = io('http://localhost:5000', {
          auth: { token },
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from server');
          setIsConnected(false);
        });

        newSocket.on('user.online', ({ userId }: { userId: string }) => {
          setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
        });

        newSocket.on('user.offline', ({ userId }: { userId: string }) => {
          setOnlineUsers(prev => prev.filter(id => id !== userId));
        });

        newSocket.on('user.typing', ({ userId, username, chatId }: { userId: string; username: string; chatId: string }) => {
          setTypingUsers(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []).filter(name => name !== username), username]
          }));
        });

        newSocket.on('user.stopTyping', ({ userId, chatId }: { userId: string; chatId: string }) => {
          setTypingUsers(prev => ({
            ...prev,
            [chatId]: (prev[chatId] || []).filter((_, index) => index !== 0)
          }));
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingUsers,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
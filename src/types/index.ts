export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  lastSeen: string;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  participants: User[];
  isGroupChat: boolean;
  chatName?: string;
  chatDescription?: string;
  groupAdmin?: string;
  lastMessage?: Message;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  chat: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'emoji';
  readBy: {
    user: string;
    readAt: string;
  }[];
  deliveredTo: {
    user: string;
    deliveredAt: string;
  }[];
  edited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  message: string;
  error?: string;
}
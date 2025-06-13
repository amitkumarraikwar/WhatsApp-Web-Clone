import { api } from './authService';
import { Chat, Message, User } from '../types';

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const response = await api.get('/chats');
    return response.data.chats;
  },

  async createChat(participantId: string): Promise<Chat> {
    const response = await api.post('/chats', { participantId });
    return response.data.chat;
  },

  async getChatById(chatId: string): Promise<Chat> {
    const response = await api.get(`/chats/${chatId}`);
    return response.data.chat;
  },

  async markChatAsRead(chatId: string): Promise<void> {
    await api.put(`/chats/${chatId}/read`);
  },

  async getMessages(chatId: string, page = 1, limit = 50): Promise<{ messages: Message[]; hasMore: boolean }> {
    const response = await api.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
    return {
      messages: response.data.messages,
      hasMore: response.data.hasMore,
    };
  },

  async sendMessage(chatId: string, content: string, messageType = 'text'): Promise<Message> {
    const response = await api.post('/messages', { chatId, content, messageType });
    return response.data.message;
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    await api.put(`/messages/${messageId}/read`);
  },

  async getUsers(search?: string): Promise<User[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/users${query}`);
    return response.data.users;
  },
};
import { API_BASE_URL } from '../config/api';
import HTTPTransport from '../utils/HTTPTransport';

const http = new HTTPTransport(API_BASE_URL);

type ChatLastMessageUser = {
  first_name: string;
  second_name: string;
  avatar: string | null;
  email: string;
  login: string;
  phone: string;
};

type ChatLastMessage = {
  user: ChatLastMessageUser;
  time: string;
  content: string;
};

export type Chat = {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: ChatLastMessage | null;
};

type GetChatsQuery = {
  offset?: number;
  limit?: number;
  title?: string;
};

type ChatUsersRequest = {
  users: number[];
  chatId: number;
};

export const chatsAPI = {
  getList(query?: GetChatsQuery): Promise<Chat[]> {
    return http.get('chats', { data: query ?? undefined }) as Promise<Chat[]>;
  },

  create(title: string): Promise<{ id: number }> {
    return http.post('chats', { data: { title } }) as Promise<{ id: number }>;
  },

  addUsers(body: ChatUsersRequest): Promise<unknown> {
    return http.put('chats/users', { data: body });
  },

  removeUsers(body: ChatUsersRequest): Promise<unknown> {
    return http.delete('chats/users', { data: body });
  }
};

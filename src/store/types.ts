import type { Chat } from '../api/chats-api';

export type Indexed = Record<string, unknown>;

export type User = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
};

export type AppState = {
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  profileLoading: boolean;
  profileError: string | null;
  chats: Chat[];
  selectedChatId: number | null;
  chatsLoading: boolean;
  chatsError: string | null;
};

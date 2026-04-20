import type { Chat, ChatUser } from '../api/chats-api';

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

export type StoredChatMessage = {
  id: number;
  time: string;
  type: string;
  user_id: number;
  content: string;
  file?: { filename?: string; path?: string };
};

export type AppState = {
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  profileLoading: boolean;
  profileError: string | null;
  chats: Chat[];
  selectedChatId: number | null;
  chatUsers: ChatUser[];
  chatMessagesByChatId: Record<number, StoredChatMessage[]>;
  chatsLoading: boolean;
  chatsError: string | null;
};

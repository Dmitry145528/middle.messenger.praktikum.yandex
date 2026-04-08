export type ChatMessageType = 'incoming' | 'outgoing';

export interface ChatListItem {
  id: number;
  name: string;
  avatar: string;
  time: string;
  message: string;
  isMe: boolean;
  unreadCount: number;
  isActive: boolean;
}

export interface ChatMessage {
  text: string;
  time: string;
  type: ChatMessageType;
  isRead?: boolean;
}

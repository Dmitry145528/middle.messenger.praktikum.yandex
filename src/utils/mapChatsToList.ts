import type { Chat } from '../api/chats-api';
import type { User } from '../store/types';
import type { ChatListItem } from '../pages/chat/chat-types';

function formatChatTime(iso: string | undefined): string {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function previewText(text: string, max = 72): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max)}…`;
}

export function mapChatsToList(
  chats: Chat[] | null,
  user: User | null,
  selectedChatId: number | null
): ChatListItem[] {
  if (!chats?.length) {
    return [];
  }
  const myLogin = user?.login ?? '';
  return chats.map((chat) => {
    const last = chat.last_message;
    const content = last?.content?.trim() ? previewText(last.content) : 'Нет сообщений';
    const isMe = Boolean(last && myLogin && last.user?.login === myLogin);
    return {
      id: chat.id,
      name: chat.title || `Чат #${chat.id}`,
      time: formatChatTime(last?.time),
      message: content,
      isMe,
      unreadCount: chat.unread_count ?? 0,
      isActive: chat.id === selectedChatId
    };
  });
}

export function getActiveChatTitle(chats: Chat[] | null, selectedChatId: number | null): string {
  if (selectedChatId == null || !chats?.length) {
    return 'Выберите чат';
  }
  const c = chats.find((x) => x.id === selectedChatId);
  return c?.title?.trim() ? c.title : `Чат #${selectedChatId}`;
}

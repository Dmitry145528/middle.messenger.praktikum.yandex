import type { StoredChatMessage } from '../store/types';
import type { ChatMessage } from '../pages/chat/chat-types';

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function mapStoredChatMessagesToView(
  messages: StoredChatMessage[] | undefined,
  myUserId: number | undefined
): ChatMessage[] {
  if (!messages?.length) {
    return [];
  }
  const sorted = [...messages].sort((a, b) => a.id - b.id);
  return sorted.map((m) => {
    let text = m.content ?? '';
    if (m.type === 'file' && m.file?.filename) {
      text = text.trim() ? text : m.file.filename;
    }
    return {
      text,
      time: formatMessageTime(m.time),
      type: m.user_id === myUserId ? 'outgoing' : 'incoming',
      isRead: true
    } satisfies ChatMessage;
  });
}

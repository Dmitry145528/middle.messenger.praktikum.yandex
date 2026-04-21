import type { StoredChatMessage } from '../store/types';
import type { ChatMessage } from '../pages/chat/chat-types';
import { resolveAvatarUrl } from './avatarUrl';

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
    const isSticker = m.type === 'sticker';
    const isImageFile =
      m.type === 'file' && Boolean(m.file?.content_type?.startsWith('image/'));
    const isVideoFile =
      m.type === 'file' && Boolean(m.file?.content_type?.startsWith('video/'));
    const showAttachment =
      isSticker || isImageFile || isVideoFile
        ? Boolean(m.file?.path)
        : false;

    let attachmentRemoteUrl = '';
    if (showAttachment && m.file?.path) {
      attachmentRemoteUrl = resolveAvatarUrl(m.file.path);
    }

    let text = m.content ?? '';
    if (isSticker) {
      text = '';
    } else if (m.type === 'file' && m.file?.filename) {
      if (!showAttachment) {
        text = text.trim() ? text : m.file.filename;
      } else if (isVideoFile) {
        text = text.trim() ? text : m.file.filename;
      } else if (isImageFile) {
        text = '';
      }
    }

    return {
      text,
      time: formatMessageTime(m.time),
      type: m.user_id === myUserId ? 'outgoing' : 'incoming',
      isRead: true,
      attachmentRemoteUrl: attachmentRemoteUrl || undefined,
      attachmentIsVideo: isVideoFile || undefined
    } satisfies ChatMessage;
  });
}

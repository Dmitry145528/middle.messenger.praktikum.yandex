const DEFAULT_API = 'https://ya-praktikum.tech/api/v2';

const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL =
  typeof envUrl === 'string' && envUrl.length > 0 ? envUrl.replace(/\/$/, '') : DEFAULT_API;

export function getWebSocketOrigin(): string {
  const base = API_BASE_URL.replace(/\/api\/v2\/?$/, '');
  if (base.startsWith('https://')) {
    return `wss://${base.slice('https://'.length)}`;
  }
  if (base.startsWith('http://')) {
    return `ws://${base.slice('http://'.length)}`;
  }
  return base;
}

export function buildChatWebSocketUrl(userId: number, chatId: number, token: string): string {
  return `${getWebSocketOrigin()}/ws/chats/${userId}/${chatId}/${token}`;
}

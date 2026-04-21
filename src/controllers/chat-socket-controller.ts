import { chatsAPI } from '../api/chats-api';
import store from '../store/store';
import { buildChatWebSocketUrl } from '../config/api';
import type { StoredChatMessage } from '../store/types';

const PING_MS = 25000;

function mergeChatMessages(chatId: number, incoming: StoredChatMessage[]): void {
  const state = store.getState();
  const prev = state.chatMessagesByChatId[chatId] ?? [];
  const byId = new Map<number, StoredChatMessage>();
  for (const m of prev) {
    byId.set(m.id, m);
  }
  for (const m of incoming) {
    byId.set(m.id, m);
  }
  const merged = [...byId.values()].sort((a, b) => a.id - b.id);
  store.patch({
    chatMessagesByChatId: {
      ...state.chatMessagesByChatId,
      [chatId]: merged
    }
  });
}

function toStoredMessage(data: unknown): StoredChatMessage | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const o = data as Record<string, unknown>;
  const t = o.type;
  if (t === 'user connected' || t === 'pong' || t === 'ping') {
    return null;
  }
  const id = Number(o.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const user_id = Number(o.user_id);
  if (!Number.isFinite(user_id)) {
    return null;
  }
  const time = typeof o.time === 'string' ? o.time : '';
  const type = typeof o.type === 'string' ? o.type : 'message';
  const content = typeof o.content === 'string' ? o.content : '';
  let file: StoredChatMessage['file'];
  if (o.file && typeof o.file === 'object') {
    const f = o.file as Record<string, unknown>;
    file = {
      filename: typeof f.filename === 'string' ? f.filename : undefined,
      path: typeof f.path === 'string' ? f.path : undefined,
      content_type: typeof f.content_type === 'string' ? f.content_type : undefined
    };
  }
  return { id, time, type, user_id, content, file };
}

const ChatSocketController = {
  _ws: null as WebSocket | null,
  _ping: null as ReturnType<typeof setInterval> | null,
  _boundChatId: null as number | null,
  _historyPending: false,
  _unsub: null as (() => void) | null,

  start(): void {
    if (this._unsub) {
      return;
    }
    const run = (): void => {
      void this._sync();
    };
    run();
    this._unsub = store.subscribe(run);
  },

  stop(): void {
    this._unsub?.();
    this._unsub = null;
    this._disconnect();
  },

  sendMessage(text: string): void {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this._ws.send(JSON.stringify({ type: 'message', content: text }));
  },

  sendFileResourceId(resourceId: string): void {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this._ws.send(JSON.stringify({ type: 'file', content: resourceId }));
  },

  sendStickerId(stickerId: string): void {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this._ws.send(JSON.stringify({ type: 'sticker', content: stickerId }));
  },

  _disconnect(): void {
    if (this._ping) {
      clearInterval(this._ping);
      this._ping = null;
    }
    if (this._ws) {
      this._ws.onopen = null;
      this._ws.onmessage = null;
      this._ws.onerror = null;
      this._ws.onclose = null;
      this._ws.close();
      this._ws = null;
    }
    this._boundChatId = null;
    this._historyPending = false;
  },

  async _sync(): Promise<void> {
    const { selectedChatId, user } = store.getState();
    const userId = user?.id;
    if (selectedChatId == null || userId == null) {
      this._disconnect();
      return;
    }
    if (this._boundChatId === selectedChatId && this._ws?.readyState === WebSocket.OPEN) {
      return;
    }
    this._disconnect();
    this._boundChatId = selectedChatId;
    try {
      const { token } = await chatsAPI.getMessagesToken(selectedChatId);
      const url = buildChatWebSocketUrl(userId, selectedChatId, token);
      const ws = new WebSocket(url);
      this._ws = ws;
      ws.onopen = () => {
        this._historyPending = true;
        ws.send(JSON.stringify({ type: 'get old', content: '0' }));
        this._ping = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_MS);
      };
      ws.onmessage = (ev: MessageEvent) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(ev.data as string);
        } catch {
          return;
        }
        const chatId = this._boundChatId;
        if (chatId == null) {
          return;
        }
        if (Array.isArray(parsed)) {
          const batch = parsed
            .map(toStoredMessage)
            .filter((m): m is StoredChatMessage => m != null);
          mergeChatMessages(chatId, batch);
          if (this._historyPending) {
            if (parsed.length === 20) {
              const lastRaw = parsed[parsed.length - 1] as { id?: unknown };
              const lastId = Number(lastRaw?.id);
              if (Number.isFinite(lastId)) {
                ws.send(JSON.stringify({ type: 'get old', content: String(lastId) }));
              } else {
                this._historyPending = false;
              }
            } else {
              this._historyPending = false;
            }
          }
          return;
        }
        if (parsed && typeof parsed === 'object') {
          const p = parsed as { type?: string };
          if (p.type === 'message' || p.type === 'file' || p.type === 'sticker') {
            const m = toStoredMessage(parsed);
            if (m) {
              mergeChatMessages(chatId, [m]);
            }
          }
        }
      };
      ws.onclose = () => {
        if (this._ws === ws) {
          this._disconnect();
        }
      };
    } catch {
      this._disconnect();
    }
  }
};

export default ChatSocketController;

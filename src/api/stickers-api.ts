import { API_BASE_URL } from '../config/api';
import HTTPTransport from '../utils/HTTPTransport';

const http = new HTTPTransport(API_BASE_URL);

export type StickerPackSummary = {
  id: number;
  title?: string;
};

export type StickerItem = {
  id: number;
  path?: string;
};

function normalizeStickerPacks(raw: unknown): StickerPackSummary[] {
  if (Array.isArray(raw)) {
    return raw as StickerPackSummary[];
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) {
      return o.data as StickerPackSummary[];
    }
    if (Array.isArray(o.sticker_packs)) {
      return o.sticker_packs as StickerPackSummary[];
    }
  }
  return [];
}

function normalizeStickersList(raw: unknown): StickerItem[] {
  if (Array.isArray(raw)) {
    return raw as StickerItem[];
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) {
      return o.data as StickerItem[];
    }
    if (Array.isArray(o.stickers)) {
      return o.stickers as StickerItem[];
    }
  }
  return [];
}

export const stickersAPI = {
  async getPacks(): Promise<StickerPackSummary[]> {
    const raw = await http.get('stickers');
    return normalizeStickerPacks(raw);
  },

  async getStickers(packId: number): Promise<StickerItem[]> {
    const raw = await http.get(`stickers/${packId}/`);
    return normalizeStickersList(raw);
  }
};

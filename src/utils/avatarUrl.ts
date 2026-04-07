import { API_BASE_URL } from '../config/api';

const apiBase = API_BASE_URL.replace(/\/$/, '');
const apiHost = apiBase.replace(/\/api\/v2\/?$/, '');

export function resolveAvatarUrl(avatar: string | null | undefined): string {
  if (avatar == null || typeof avatar !== 'string') {
    return '';
  }
  const trimmed = avatar.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (path.startsWith('/api/v2/resources/')) {
    return `${apiHost}${path}`;
  }
  if (path.startsWith('/resources/')) {
    return `${apiBase}${path}`;
  }
  return `${apiBase}/resources${path}`;
}

const DEFAULT_API = 'https://ya-praktikum.tech/api/v2';

const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL =
  typeof envUrl === 'string' && envUrl.length > 0 ? envUrl.replace(/\/$/, '') : DEFAULT_API;

export const API_HOST = API_BASE_URL.replace(/\/api\/v2\/?$/, '');

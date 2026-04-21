import { API_BASE_URL } from '../config/api';
import HTTPTransport from '../utils/HTTPTransport';

const http = new HTTPTransport(API_BASE_URL);

export type UploadedResource = {
  id: number;
  user_id?: number;
  path?: string;
  filename?: string;
  content_type?: string;
  content_size?: number;
  upload_date?: string;
};

export const resourcesAPI = {
  upload(file: File): Promise<UploadedResource> {
    const form = new FormData();
    form.append('resource', file);
    return http.post('resources', { data: form }) as Promise<UploadedResource>;
  }
};

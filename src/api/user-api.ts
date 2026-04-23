import { API_BASE_URL } from '../config/api';
import HTTPTransport from '../utils/HTTPTransport';
import type { User } from '../store/types';

const http = new HTTPTransport(API_BASE_URL);

export type UpdateProfilePayload = {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
};

export type UpdatePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export const userAPI = {
  updateProfile(data: UpdateProfilePayload): Promise<User> {
    return http.put('user/profile', { data }) as Promise<User>;
  },

  updatePassword(data: UpdatePasswordPayload): Promise<unknown> {
    return http.put('user/password', { data });
  },

  updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return http.put('user/profile/avatar', { data: formData }) as Promise<User>;
  }
};

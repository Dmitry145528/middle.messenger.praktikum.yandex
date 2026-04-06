import { API_BASE_URL } from '../config/api';
import HTTPTransport from '../utils/HTTPTransport';
import BaseAPI from './base-api';
import type { User } from '../store/types';

const http = new HTTPTransport(API_BASE_URL);

export type SignInPayload = {
  login: string;
  password: string;
};

export type SignUpPayload = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};

export default class AuthAPI extends BaseAPI {
  signIn(data: SignInPayload): Promise<unknown> {
    return http.post('auth/signin', { data });
  }

  signUp(data: SignUpPayload): Promise<{ id: number }> {
    return http.post('auth/signup', { data }) as Promise<{ id: number }>;
  }

  getUser(): Promise<User> {
    return http.get('auth/user') as Promise<User>;
  }

  logout(): Promise<unknown> {
    return http.post('auth/logout', {});
  }
}

export const authAPI = new AuthAPI();

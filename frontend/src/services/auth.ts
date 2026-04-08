import api from './api';
import { storage } from './storage';
import type { TokenPair, User, LoginPayload, RegisterPayload } from '../types';

interface LoginFormData {
  email: string;
  password: string;
}

export async function login(payload: LoginFormData): Promise<User> {
  // OAuth2 form encoding required by FastAPI
  const form = new URLSearchParams();
  form.append('username', payload.email);
  form.append('password', payload.password);

  const { data } = await api.post<TokenPair>('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  storage.setTokens(data.access_token, data.refresh_token);
  const user = await getMe();
  storage.setUser(user);
  return user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function refreshToken(refreshToken: string): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>('/auth/refresh', { refresh_token: refreshToken });
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    storage.clearTokens();
  }
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await api.put<User>('/auth/me', payload);
  storage.setUser(data);
  return data;
}

export type { LoginPayload };

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';
import type { TokenPair } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
}

// Attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      storage.clearTokens();
      window.location.href = '/giris';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(resolve => {
        refreshQueue.push(token => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<TokenPair>(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      storage.setTokens(data.access_token, data.refresh_token);
      onRefreshed(data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    } catch {
      storage.clearTokens();
      window.location.href = '/giris';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

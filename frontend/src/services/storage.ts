const TOKEN_KEY = 'sinav_access_token';
const REFRESH_KEY = 'sinav_refresh_token';
const USER_KEY = 'sinav_user';

export const storage = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_KEY, token);
  },
  setTokens(access: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser<T>(user: T): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

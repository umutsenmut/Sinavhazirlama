export interface User {
  id: number;
  email: string;
  full_name: string;
  school?: string;
  subject?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  school?: string;
  subject?: string;
  password?: string;
}

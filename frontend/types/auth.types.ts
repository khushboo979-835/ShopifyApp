import { User } from './user.types';
export type { User };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, name: string, role?: 'user' | 'admin') => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}
import apiClient from './apiClient';
import { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth.types';
import { User } from '@/types/user.types';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/auth/login', { email, password });
    return response.data.data;
  },

  // Register
  register: async (email: string, password: string, name: string, role?: 'user' | 'admin'): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/auth/register', {
      email,
      password,
      name,
      role,
    });
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/api/auth/me');
    return response.data.data;
  },

  // Refresh token (used internally by interceptor, but also exposed if needed)
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{ data: { accessToken: string; refreshToken: string } }>(
      '/api/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data;
  },
};
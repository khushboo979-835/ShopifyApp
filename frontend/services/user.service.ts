import apiClient from './apiClient';
import { User, UpdateUserData } from '@/types/user.types';

export const userService = {
  // Get current user profile (if needed)
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/api/users/profile');
    return response.data.data;
  },

  // Update current user profile
  updateProfile: async (data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put<{ data: User }>('/api/users/profile', data);
    return response.data.data;
  },

  // Delete account
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/api/users/profile');
  },
};
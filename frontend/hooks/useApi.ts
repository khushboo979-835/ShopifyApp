'use client';

import { useState } from 'react';
import apiClient from '@/services/apiClient';
import { AxiosError } from 'axios';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = <T = any>(options?: UseApiOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = async (method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: any) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (method) {
        case 'get':
          response = await apiClient.get(url);
          break;
        case 'post':
          response = await apiClient.post(url, payload);
          break;
        case 'put':
          response = await apiClient.put(url, payload);
          break;
        case 'delete':
          response = await apiClient.delete(url);
          break;
        default:
          throw new Error('Invalid method');
      }
      setData(response.data);
      if (options?.onSuccess) options.onSuccess(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'API request failed';
      setError(errorMessage);
      if (options?.onError) options.onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, execute };
};
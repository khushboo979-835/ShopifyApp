import apiClient from './apiClient';
import { Product, CreateProductData, UpdateProductData } from '@/types/product.types';

export const productService = {
  // Get all products with pagination
  getAll: async (page: number = 1, limit: number = 10): Promise<{ products: Product[]; total: number }> => {
    const response = await apiClient.get<{ data: { products: Product[]; total: number } }>(
      `/api/products?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ data: Product }>(`/api/products/${id}`);
    return response.data.data;
  },

  // Create product
  create: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post<{ data: Product }>('/api/products', data);
    return response.data.data;
  },

  // Update product
  update: async (id: string, data: UpdateProductData): Promise<Product> => {
    const response = await apiClient.put<{ data: Product }>(`/api/products/${id}`, data);
    return response.data.data;
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};
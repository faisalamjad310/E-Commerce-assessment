import api from '../lib/api';
import type { Product } from './products';

export interface AdminProductPayload {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export const adminProductsApi = {
  getAll: (page = 1, limit = 48) =>
    api
      .get<{ items: Product[]; total: number; page: number; totalPages: number }>(
        '/api/products',
        { params: { page, limit, sortBy: 'newest' } },
      )
      .then((r) => r.data),

  getOne: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then((r) => r.data),

  create: (payload: AdminProductPayload) =>
    api.post<Product>('/api/products', payload).then((r) => r.data),

  update: (id: string, payload: Partial<AdminProductPayload>) =>
    api.patch<Product>(`/api/products/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/api/products/${id}`),

  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api
      .post<{ url: string }>('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};

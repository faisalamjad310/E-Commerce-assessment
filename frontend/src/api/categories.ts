import api from '../lib/api';

export interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  createdAt: string;
}

export const categoriesApi = {
  list: () => api.get<Category[]>('/api/categories').then(r => r.data),
  getOne: (id: string) => api.get<Category>(`/api/categories/${id}`).then(r => r.data),
  create: (data: { name: string; description?: string; imageUrl: string }) =>
    api.post<Category>('/api/categories', data).then(r => r.data),
  update: (id: string, data: Partial<{ name: string; description: string; imageUrl: string }>) =>
    api.patch<Category>(`/api/categories/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/api/categories/${id}`).then(r => r.data),
};

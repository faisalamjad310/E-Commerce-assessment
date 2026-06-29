import api from '../lib/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number; // integer cents
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
}

export interface CatalogResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CatalogParams {
  search?: string;
  category?: string;
  minPrice?: number; // cents
  maxPrice?: number; // cents
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export const productsApi = {
  catalog: (params: CatalogParams) =>
    api.get<CatalogResponse>('/api/products', { params }).then(r => r.data),

  suggestions: (q: string) =>
    api
      .get<CatalogResponse>('/api/products', { params: { search: q, limit: 6 } })
      .then(r => r.data.items),

  getOne: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then(r => r.data),

  categories: () =>
    api.get<string[]>('/api/products/categories').then(r => r.data),

  recommendations: (excludeProductId?: string) =>
    api
      .get<Product[]>('/api/recommendations', {
        params: excludeProductId ? { excludeProductId } : undefined,
      })
      .then((r) => r.data),
};

export function formatPrice(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

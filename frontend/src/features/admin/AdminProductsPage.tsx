import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import { adminProductsApi } from '../../api/admin';
import { formatPrice } from '../../api/products';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminProductsApi.getAll(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminProductsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingId(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to delete product');
      setDeletingId(null);
    },
  });

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError(null);
    deleteMutation.mutate(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total != null ? `${data.total} products in catalog` : 'Loading…'}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn-gradient flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl mb-4 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm animate-pulse">
            Loading products…
          </div>
        ) : !data?.items.length ? (
          <div className="p-14 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No products yet</p>
            <p className="text-sm text-gray-400 mb-4">Add your first product to get started.</p>
            <Link
              to="/admin/products/new"
              className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 w-14">
                    Image
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">
                    Price
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/40x40/e0e7ff/6366f1?text=?';
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 max-w-[200px] truncate">
                        {product.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell font-medium text-gray-700">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span
                        className={`font-medium ${
                          product.stock === 0
                            ? 'text-red-500'
                            : product.stock <= 5
                              ? 'text-amber-500'
                              : 'text-gray-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deletingId === product._id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

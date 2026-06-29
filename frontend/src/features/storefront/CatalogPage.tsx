import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ShoppingBag } from 'lucide-react';
import { productsApi } from '../../api/products';
import ProductCard from '../../components/ProductCard';
import CategoryFilter from '../../components/CategoryFilter';
import PriceRangeFilter from '../../components/PriceRangeFilter';
import SortSelect from '../../components/SortSelect';
import Pagination from '../../components/Pagination';

function SkeletonCard() {
  return (
    <div className="theme-card rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-100 dark:bg-white/8" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full w-1/2" />
        <div className="h-5 bg-gray-100 dark:bg-white/10 rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [params] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = params.get('search') ?? undefined;
  const category = params.get('category') ?? undefined;
  const rawMin = params.get('minPrice');
  const rawMax = params.get('maxPrice');
  const sortBy = (params.get('sortBy') as 'price_asc' | 'price_desc' | 'newest') ?? 'newest';
  const page = Math.max(1, Number(params.get('page') ?? '1'));

  const minPrice = rawMin ? Math.round(parseFloat(rawMin) * 100) : undefined;
  const maxPrice = rawMax ? Math.round(parseFloat(rawMax) * 100) : undefined;

  const queryParams = {
    ...(search && { search }),
    ...(category && { category }),
    ...(minPrice !== undefined && { minPrice }),
    ...(maxPrice !== undefined && { maxPrice }),
    sortBy,
    page,
    limit: 12,
  };

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.catalog(queryParams),
    placeholderData: prev => prev,
  });

  const activeFilterCount = [search, category, rawMin, rawMax].filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-6">
      <CategoryFilter />
      <div className="border-t border-gray-100 dark:border-white/10 pt-6">
        <PriceRangeFilter />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        {search ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Results for <span className="gradient-text">"{search}"</span>
            </h1>
            {data && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {data.total} product{data.total !== 1 ? 's' : ''} found
              </p>
            )}
          </>
        ) : category ? (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <span className="gradient-text">{category}</span>
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h1>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20">{filterPanel}</div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <span className="hidden lg:block text-sm text-gray-400 dark:text-gray-500 flex-1">
              {data ? `${data.total} item${data.total !== 1 ? 's' : ''}` : ' '}
            </span>

            <SortSelect />
          </div>

          {/* Grid */}
          <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-200' : ''}>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShoppingBag className="w-14 h-14 text-gray-200 dark:text-white/20 mb-4" />
                <p className="text-gray-500 dark:text-gray-300 font-medium">
                  Could not load products
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Make sure the backend is running on port 3000
                </p>
              </div>
            ) : !data?.items.length ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShoppingBag className="w-14 h-14 text-gray-200 dark:text-white/20 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">No products found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
                {data.items.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-10">
              <Pagination page={data.page} totalPages={data.totalPages} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0d1226] border-r border-gray-200 dark:border-white/10 shadow-2xl z-50 lg:hidden animate-slide-in-left overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">{filterPanel}</div>
          </div>
        </>
      )}
    </div>
  );
}

import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';

export default function CategoryFilter() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('category') ?? '';

  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: productsApi.categories,
    staleTime: 5 * 60 * 1000,
  });

  function toggle(cat: string) {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (next.get('category') === cat) {
        next.delete('category');
      } else {
        next.set('category', cat);
        next.set('page', '1');
      }
      return next;
    });
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        Categories
      </h3>
      <div className="space-y-0.5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selected === cat
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
        {selected && (
          <button
            onClick={() =>
              setParams(prev => {
                const next = new URLSearchParams(prev);
                next.delete('category');
                next.set('page', '1');
                return next;
              })
            }
            className="w-full text-left px-3 py-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            × Clear
          </button>
        )}
      </div>
    </div>
  );
}

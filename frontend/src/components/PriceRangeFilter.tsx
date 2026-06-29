import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PriceRangeFilter() {
  const [params, setParams] = useSearchParams();
  const rawMin = params.get('minPrice') ?? '';
  const rawMax = params.get('maxPrice') ?? '';

  // Controlled so they stay in sync when URL changes externally (browser back)
  const [min, setMin] = useState(rawMin);
  const [max, setMax] = useState(rawMax);

  useEffect(() => { setMin(rawMin); }, [rawMin]);
  useEffect(() => { setMax(rawMax); }, [rawMax]);

  function apply(newMin: string, newMax: string) {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (newMin) next.set('minPrice', newMin); else next.delete('minPrice');
      if (newMax) next.set('maxPrice', newMax); else next.delete('maxPrice');
      next.set('page', '1');
      return next;
    });
  }

  function clear() {
    setMin('');
    setMax('');
    apply('', '');
  }

  const hasFilter = rawMin || rawMax;

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        Price Range
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={min}
              onChange={e => setMin(e.target.value)}
              onBlur={() => apply(min, max)}
              onKeyDown={e => e.key === 'Enter' && apply(min, max)}
              className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
            />
          </div>
          <span className="text-gray-400 text-xs shrink-0">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={max}
              onChange={e => setMax(e.target.value)}
              onBlur={() => apply(min, max)}
              onKeyDown={e => e.key === 'Enter' && apply(min, max)}
              className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        {hasFilter && (
          <button
            onClick={clear}
            className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            × Clear range
          </button>
        )}
      </div>
    </div>
  );
}

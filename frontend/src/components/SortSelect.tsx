import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';

const OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
] as const;

export default function SortSelect() {
  const [params, setParams] = useSearchParams();
  const current = params.get('sortBy') ?? 'newest';

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
      <select
        value={current}
        onChange={e => {
          setParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('sortBy', e.target.value);
            next.set('page', '1');
            return next;
          });
        }}
        className="bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer text-sm"
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

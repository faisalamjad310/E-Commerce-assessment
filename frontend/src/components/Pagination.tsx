import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
}

function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages }: Props) {
  const [, setParams] = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const pageList = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageList.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="w-9 text-center text-sm text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? 'btn-gradient text-white shadow-sm'
                : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

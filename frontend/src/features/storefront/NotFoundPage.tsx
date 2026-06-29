import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">Page not found</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}

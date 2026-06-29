import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LogIn, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value.trim();
    setSearchParams(q ? { search: q } : {});
    navigate(`/?${q ? `search=${encodeURIComponent(q)}` : ''}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-indigo-600 shrink-0">
          CartVerse
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="search"
              defaultValue={searchParams.get('search') ?? ''}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </form>

        <nav className="flex items-center gap-3 ml-auto">
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-700">
                <User className="w-4 h-4" />
                {user.name}
              </span>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full font-medium hover:bg-amber-200 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LogIn, Search, Sun, Moon, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { useTheme } from '../../lib/theme';
import CartVerseLogo from '../CartVerseLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchRef.current?.value.trim() ?? '';
    navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm dark:shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="shrink-0">
          <CartVerseLogo size={34} textSize="text-lg" />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-2 sm:mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchRef}
              name="search"
              defaultValue={searchParams.get('search') ?? ''}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/8 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 theme-card rounded-xl shadow-xl dark:shadow-black/40 py-1.5 z-50 animate-slide-down">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Orders
                  </Link>

                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                to="/signup"
                className="btn-gradient px-4 py-1.5 text-sm font-semibold text-white rounded-lg shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

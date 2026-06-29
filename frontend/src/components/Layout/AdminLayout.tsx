import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 shrink-0 bg-gray-900 text-gray-300 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-700">
          <span className="text-white font-bold text-lg">CartVerse</span>
          <span className="ml-2 text-xs bg-amber-500 text-gray-900 px-1.5 py-0.5 rounded font-medium">Admin</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-3 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-2 text-sm text-gray-500">
          <span>Admin Panel</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">{user?.name}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

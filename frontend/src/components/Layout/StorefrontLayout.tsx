import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../../lib/theme';

export default function StorefrontLayout() {
  const { isDark } = useTheme();
  return (
    <div className={`${isDark ? 'dark storefront-bg' : 'bg-gray-50'} min-h-screen`}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, X, Globe, Rss } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-950 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">

        {/* ── Main grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-gray-900 dark:text-white font-bold text-lg">CartVerse</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed mb-5">
              Your modern marketplace for electronics, fashion, books, and more. Curated quality, delivered fast.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: X,    label: 'X / Twitter' },
                { icon: Globe,label: 'Website' },
                { icon: Rss,  label: 'Blog / RSS' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">About Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <p className="text-gray-500 leading-relaxed">
                  CartVerse is a curated online marketplace built to make shopping simple, fast, and enjoyable. We partner with top brands to bring you the best products at fair prices.
                </p>
              </li>
              <li className="pt-1">
                <Link to="/shop" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium">
                  Explore the store →
                </Link>
              </li>
            </ul>
          </div>

          {/* How to Buy */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">How to Buy</h4>
            <ul className="space-y-3">
              {[
                { n: '1', label: 'Browse or search products' },
                { n: '2', label: 'Add items to your cart' },
                { n: '3', label: 'Sign in & checkout securely' },
                { n: '4', label: 'Track your delivery' },
              ].map(({ n, label }) => (
                <li key={n} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {n}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <a href="mailto:support@cartverse.com" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  support@cartverse.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span>42 Commerce Street,<br />London EC2A 4AX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">© {new Date().getFullYear()} CartVerse. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-600">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

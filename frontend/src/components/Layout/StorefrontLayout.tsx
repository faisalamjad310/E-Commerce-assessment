import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../lib/theme';

const ANNOUNCE_KEY = 'cv-announce-v2';

const MESSAGES = [
  '🎉 Free shipping on all orders over $50 — Shop now',
  '⚡ New arrivals added every week — Explore latest',
  '🛡️ 30-day hassle-free returns on every order',
  '🔒 Secure checkout with 256-bit SSL encryption',
];

function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(ANNOUNCE_KEY) === '1'
  );
  const [idx, setIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setTextVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length);
        setTextVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  if (dismissed) return null;

  return (
    <div className="announcement-bar relative flex items-center justify-center gap-2 px-10 py-2 text-white text-[12.5px] font-semibold tracking-wide shadow-md">
      <Sparkles className="w-3.5 h-3.5 opacity-80 shrink-0 animate-pulse" />
      <span
        className={`transition-opacity duration-300 text-center ${textVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {MESSAGES[idx]}
      </span>
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem(ANNOUNCE_KEY, '1');
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function StorefrontLayout() {
  const { isDark } = useTheme();
  return (
    <div className={`${isDark ? 'dark storefront-bg' : 'bg-gray-50'} min-h-screen flex flex-col`}>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

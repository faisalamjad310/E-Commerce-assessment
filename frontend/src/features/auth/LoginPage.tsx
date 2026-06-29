import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Sun, Moon, ArrowRight, Loader2 } from 'lucide-react';
import CartVerseLogo from '../../components/CartVerseLogo';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import api from '../../lib/api';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      auth.login(res.data.access_token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setServerError(Array.isArray(msg) ? msg[0] : msg);
    }
  }

  return (
    <div className="auth-bg min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated blobs */}
      <div className="animate-blob-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-300 dark:bg-indigo-900 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-40 pointer-events-none" />
      <div className="animate-blob-2 absolute -top-16 -right-32 w-[450px] h-[450px] rounded-full bg-violet-300 dark:bg-violet-900 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-40 pointer-events-none" />
      <div className="animate-blob-3 absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-300 dark:bg-cyan-900 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-35 pointer-events-none" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl glass-card shadow-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-2xl shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5 p-8 sm:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <CartVerseLogo size={48} textSize="text-2xl" className="mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 text-center">
              Sign in to continue to your account
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="animate-slide-down mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500 pointer-events-none w-[18px] h-[18px]" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  {...register('email')}
                  className={`input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.email
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 w-[18px] h-[18px]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register('password')}
                  className={`input-field w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.password
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-semibold text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-600">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          Secured with end-to-end encryption · Your data stays private
        </p>
      </div>
    </div>
  );
}

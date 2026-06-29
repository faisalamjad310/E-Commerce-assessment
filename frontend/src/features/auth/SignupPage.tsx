import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Sun, Moon, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import CartVerseLogo from '../../components/CartVerseLogo';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import api from '../../lib/api';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  if (score === 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
  if (score === 2) return { level: 2, label: 'Good', color: 'bg-amber-400' };
  return { level: 3, label: 'Strong', color: 'bg-emerald-400' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pwValue = watch('password', '');
  const strength = getPasswordStrength(pwValue);

  async function onSubmit(data: FormData) {
    setServerError('');
    try {
      const { confirmPassword: _, ...payload } = data;
      const res = await api.post('/api/auth/signup', payload);
      auth.login(res.data.access_token, res.data.user);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? 'Something went wrong. Please try again.';
      setServerError(Array.isArray(msg) ? msg[0] : msg);
    }
  }

  return (
    <div className="auth-bg min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-10">
      {/* Animated blobs */}
      <div className="animate-blob-1 absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-300 dark:bg-violet-900 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-40 pointer-events-none" />
      <div className="animate-blob-2 absolute top-1/3 -left-32 w-[450px] h-[450px] rounded-full bg-indigo-300 dark:bg-indigo-900 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-40 pointer-events-none" />
      <div className="animate-blob-3 absolute -bottom-32 right-1/4 w-[480px] h-[480px] rounded-full bg-cyan-300 dark:bg-cyan-900 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-35 pointer-events-none" />

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
        <div className="glass-card rounded-2xl shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 p-8 sm:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <CartVerseLogo size={48} textSize="text-2xl" className="mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 text-center">
              Join CartVerse and start shopping today
            </p>
          </div>

          {/* Perks */}
          <div className="flex items-center justify-center gap-5 mb-6">
            {['Free shipping', 'Easy returns', 'Secure checkout'].map((perk) => (
              <div key={perk} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="animate-slide-down mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name */}
            <div className="animate-fade-in-up delay-100" style={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 w-[18px] h-[18px]" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  {...register('name')}
                  className={`input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 ${
                    errors.name ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="animate-fade-in-up delay-150" style={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 w-[18px] h-[18px]" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 ${
                    errors.email ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="animate-fade-in-up delay-200" style={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 w-[18px] h-[18px]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...register('password')}
                  className={`input-field w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 ${
                    errors.password ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {pwValue.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength.level >= lvl ? strength.color : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`mt-1 text-xs font-medium ${
                      strength.level === 1 ? 'text-red-500' :
                      strength.level === 2 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="animate-fade-in-up delay-250" style={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 w-[18px] h-[18px]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  {...register('confirmPassword')}
                  className={`input-field w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 ${
                    errors.confirmPassword ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient animate-fade-in-up delay-300 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-semibold text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              style={{ opacity: 0 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-600">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, CreditCard, Lock, MapPin, CheckCircle, User } from 'lucide-react';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { ordersApi, type ShippingAddress, type GuestContact } from '../../api/orders';
import { formatPrice } from '../../api/products';
import { queryClient } from '../../lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

// ── Types ─────────────────────────────────────────────────────────────────────

type CheckoutForm = {
  name: string;
  address: string;
  city: string;
  email?: string;
  phone?: string;
};

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {(['1', '2'] as const).map((s, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={s} className="flex items-center gap-3">
            {i > 0 && <div className={`h-px w-12 ${step > 1 ? 'bg-indigo-400' : 'bg-gray-200 dark:bg-white/15'}`} />}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              done  ? 'bg-indigo-600 text-white' :
              active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-500/30' :
                       'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'
            }`}>
              {done ? <CheckCircle className="w-4 h-4" /> : num}
            </div>
            <span className={`text-sm hidden sm:block ${active ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {num === 1 ? 'Details' : 'Payment'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Field component ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/8 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-all';

// ── Payment form (inner — needs Stripe context) ────────────────────────────────

interface CartLineItem {
  productId: string;
  quantity: number;
}

interface PaymentFormProps {
  shipping: ShippingAddress;
  guestContact: GuestContact | null;
  isGuest: boolean;
  cartItems: CartLineItem[];
  orderTotal: number;
  paymentIntentId: string;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

function PaymentForm({ shipping, guestContact, isGuest, cartItems, orderTotal, paymentIntentId, onBack, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      setSubmitting(true);
      setError(null);

      // Confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message ?? 'Payment failed. Please try again.');
        return;
      }

      // Payment succeeded — create the order
      if (isGuest) {
        const result = await ordersApi.guestCheckout({
          items: cartItems,
          shippingAddress: shipping,
          guestContact: guestContact!,
          paymentIntentId,
        });
        onSuccess(result.orderId);
      } else {
        const result = await ordersApi.checkout({
          shippingAddress: shipping,
          paymentIntentId,
        });
        await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        onSuccess(result.orderId);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Checkout failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-4 h-4 text-indigo-500" />
        <h2 className="font-semibold text-gray-900 dark:text-white">Payment</h2>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/5">
        <PaymentElement options={{ wallets: { applePay: 'never', googlePay: 'never' }, paymentMethodOrder: ['card'] }} />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-xl px-3 py-2">
        <Lock className="w-3.5 h-3.5 shrink-0" />
        Secured by Stripe — test card: 4242 4242 4242 4242 · any future date · any CVC
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="flex-1 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-70"
        >
          <Lock className="w-4 h-4" />
          {submitting ? 'Processing…' : `Pay ${formatPrice(orderTotal)}`}
        </button>
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, orderTotal, clearLocalCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = !user;

  const schema = useMemo(
    () =>
      z.object({
        name:    z.string().min(2, 'Full name is required'),
        address: z.string().min(5, 'Street address is required'),
        city:    z.string().min(2, 'City is required'),
        email:   isGuest ? z.string().email('Valid email address is required') : z.string().optional(),
        phone:   isGuest ? z.string().min(7, 'Valid phone number is required') : z.string().optional(),
      }),
    [isGuest],
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState<ShippingAddress | null>(null);
  const [guestContact, setGuestContact] = useState<GuestContact | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
  });

  // Create PaymentIntent when moving to step 2
  useEffect(() => {
    if (step !== 2 || clientSecret) return;

    setIntentLoading(true);
    setIntentError(null);

    const createIntent = isGuest
      ? ordersApi.createPaymentIntentGuest(orderTotal)
      : ordersApi.createPaymentIntent(orderTotal);

    createIntent
      .then(({ clientSecret: cs, paymentIntentId: piId }) => {
        setClientSecret(cs);
        setPaymentIntentId(piId);
      })
      .catch((err: unknown) => {
        const detail = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
        console.error('[Stripe intent error]', detail ?? err);
        setIntentError(
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
            ? (detail as string[]).join(', ')
            : 'Could not initialise payment. Please try again.',
        );
        setStep(1);
      })
      .finally(() => setIntentLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  function onShippingNext(data: CheckoutForm) {
    setShipping({ name: data.name, address: data.address, city: data.city });
    if (isGuest) setGuestContact({ email: data.email, phone: data.phone });
    setStep(2);
  }

  function handleSuccess(orderId: string) {
    clearLocalCart();
    if (isGuest) {
      navigate('/order-confirmation/guest', {
        state: { orderId, shippingAddress: shipping, guestContact },
      });
    } else {
      navigate(`/order-confirmation/${orderId}`);
    }
  }

  const orderSummary = (
    <div className="theme-card rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Order Summary</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.map(item => (
          <div key={item.productId} className="flex items-center gap-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-white/10 shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/e0e7ff/6366f1?text=?'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">×{item.quantity}</p>
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
              {formatPrice(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 dark:border-white/10 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span><span>{formatPrice(orderTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Shipping</span>
          <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-1">
          <span>Total</span>
          <span className="gradient-text">{formatPrice(orderTotal)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to cart
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>

      {isGuest && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Checking out as guest.{' '}
          <Link to="/login" state={{ from: '/checkout' }} className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>{' '}
          to save your order history.
        </p>
      )}

      <StepIndicator step={step} />

      {intentError && (
        <p className="mb-4 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
          {intentError}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {step === 1 ? (
            <form onSubmit={handleSubmit(onShippingNext)} className="space-y-4">
              {isGuest && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Contact Information</h2>
                  </div>

                  <Field label="Full Name" error={errors.name?.message}>
                    <input {...register('name')} placeholder="Jane Doe" className={inputCls} />
                  </Field>

                  <Field label="Email Address" error={errors.email?.message}>
                    <input {...register('email')} type="email" placeholder="jane@example.com" className={inputCls} />
                  </Field>

                  <Field label="Phone Number" error={errors.phone?.message}>
                    <input {...register('phone')} type="tel" placeholder="+44 7911 123456" className={inputCls} />
                  </Field>

                  <div className="border-t border-gray-100 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <h2 className="font-semibold text-gray-900 dark:text-white">Shipping Address</h2>
                    </div>
                  </div>
                </>
              )}

              {!isGuest && (
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Shipping Address</h2>
                </div>
              )}

              {!isGuest && (
                <Field label="Full Name" error={errors.name?.message}>
                  <input {...register('name')} placeholder="Jane Doe" className={inputCls} />
                </Field>
              )}

              <Field label="Street Address" error={errors.address?.message}>
                <input {...register('address')} placeholder="123 Main Street, Apt 4B" className={inputCls} />
              </Field>

              <Field label="City" error={errors.city?.message}>
                <input {...register('city')} placeholder="London" className={inputCls} />
              </Field>

              <button
                type="submit"
                className="w-full mt-2 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : intentLoading || !clientSecret ? (
            <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
              Preparing payment…
            </div>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#4f46e5',
                    borderRadius: '12px',
                    fontFamily: 'inherit',
                  },
                },
              }}
            >
              <PaymentForm
                shipping={shipping!}
                guestContact={guestContact}
                isGuest={isGuest}
                cartItems={items.map(i => ({ productId: i.productId, quantity: i.quantity }))}
                orderTotal={orderTotal}
                paymentIntentId={paymentIntentId}
                onBack={() => setStep(1)}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </div>

        <div className="lg:col-span-2">{orderSummary}</div>
      </div>
    </div>
  );
}

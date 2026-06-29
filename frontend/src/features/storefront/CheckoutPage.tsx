import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CreditCard, Lock, MapPin, CheckCircle } from 'lucide-react';
import { useCart } from '../../lib/cart';
import { ordersApi, type ShippingAddress } from '../../api/orders';
import { formatPrice } from '../../api/products';

const shippingSchema = z.object({
  name:    z.string().min(2, 'Full name is required'),
  address: z.string().min(5, 'Street address is required'),
  city:    z.string().min(2, 'City is required'),
});
type ShippingForm = z.infer<typeof shippingSchema>;

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {(['1', '2'] as const).map((s, i) => {
        const num = i + 1;
        const done  = step > num;
        const active = step === num;
        return (
          <div key={s} className="flex items-center gap-3">
            {i > 0 && <div className={`h-px w-12 ${step > 1 ? 'bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              done  ? 'bg-indigo-600 text-white' :
              active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/40' :
                       'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {done ? <CheckCircle className="w-4 h-4" /> : num}
            </div>
            <span className={`text-sm hidden sm:block ${active ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {num === 1 ? 'Shipping' : 'Payment'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, orderTotal, clearLocalCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState<ShippingAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
  });

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

  function onShippingNext(data: ShippingForm) {
    setShipping(data);
    setStep(2);
  }

  async function handlePay() {
    if (!shipping) return;
    try {
      setSubmitting(true);
      setError(null);
      const result = await ordersApi.checkout({ shippingAddress: shipping });
      clearLocalCart();
      navigate(`/order-confirmation/${result.orderId}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Checkout failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  const orderSummary = (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Order Summary</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.map(item => (
          <div key={item.productId} className="flex items-center gap-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
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
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5 text-sm">
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
      <StepIndicator step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-3">
          {step === 1 ? (
            <form onSubmit={handleSubmit(onShippingNext)} className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Shipping Address</h2>
              </div>

              {[
                { id: 'name' as const,    label: 'Full Name',      placeholder: 'Jane Doe' },
                { id: 'address' as const, label: 'Street Address', placeholder: '123 Main Street, Apt 4B' },
                { id: 'city' as const,    label: 'City',           placeholder: 'London' },
              ].map(f => (
                <div key={f.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    {...register(f.id)}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all"
                  />
                  {errors[f.id] && (
                    <p className="text-xs text-red-500 mt-1">{errors[f.id]!.message}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full mt-2 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Payment</h2>
              </div>

              {/* Fake credit card visual */}
              <div className="relative h-44 rounded-2xl overflow-hidden p-5 text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0891b2 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <p className="text-xs opacity-70 mb-6">Test Card</p>
                <p className="text-lg font-mono tracking-widest mb-4">4242 4242 4242 4242</p>
                <div className="flex justify-between text-sm">
                  <div><p className="text-xs opacity-70">Cardholder</p><p className="font-medium">{shipping?.name ?? 'CARD HOLDER'}</p></div>
                  <div><p className="text-xs opacity-70">Expires</p><p className="font-mono">12/28</p></div>
                </div>
              </div>

              {/* Fake form fields (UI only) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Number</label>
                  <input defaultValue="4242 4242 4242 4242" readOnly
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 font-mono cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry</label>
                    <input defaultValue="12/28" readOnly
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 font-mono cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV</label>
                    <input defaultValue="•••" readOnly
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 font-mono cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Test environment — no real payment is processed
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="flex-1 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-70"
                >
                  <Lock className="w-4 h-4" />
                  {submitting ? 'Processing…' : `Pay ${formatPrice(orderTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">{orderSummary}</div>
      </div>
    </div>
  );
}

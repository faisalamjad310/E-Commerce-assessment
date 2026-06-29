import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  ImageIcon,
  Loader2,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { adminProductsApi } from '../../api/admin';
import { productsApi } from '../../api/products';

const schema = z.object({
  name: z.string().min(1, 'Required').max(200, 'Max 200 characters'),
  description: z.string().min(1, 'Required'),
  priceDisplay: z
    .string()
    .min(1, 'Required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price like 29.99'),
  category: z.string().min(1, 'Required'),
  stock: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(0, 'Cannot be negative'),
  imageUrl: z.string().min(1, 'Upload an image'),
});

type FormData = z.infer<typeof schema>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      stock: 0,
      priceDisplay: '',
      imageUrl: '',
      name: '',
      description: '',
      category: '',
    },
  });

  const imageUrl = watch('imageUrl');

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => adminProductsApi.getOne(id!),
    enabled: isEdit,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.categories,
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        priceDisplay: (product.price / 100).toFixed(2),
        category: product.category,
        stock: product.stock,
        imageUrl: product.imageUrl,
      });
    }
  }, [product, reset]);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await adminProductsApi.uploadImage(file);
      setValue('imageUrl', url, { shouldValidate: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUploadError(msg ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: Math.round(parseFloat(data.priceDisplay) * 100),
        category: data.category,
        stock: data.stock,
        imageUrl: data.imageUrl,
      };
      if (isEdit) {
        await adminProductsApi.update(id!, payload);
      } else {
        await adminProductsApi.create(payload);
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response
        ?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : (raw ?? 'Save failed. Please try again.');
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/admin/products')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image + name/description */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
          {/* Image upload */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image <span className="text-red-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onFileInput}
            />

            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`relative w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-50'
                    : errors.imageUrl
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }
              `}
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/300x300/e0e7ff/6366f1?text=?';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-white text-xs font-semibold flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      Replace
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue('imageUrl', '', { shouldValidate: true });
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                  <p className="text-xs text-indigo-500 font-medium">Uploading…</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Click or drag to upload</p>
                  <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, WebP, GIF · max 5 MB</p>
                </>
              )}
            </div>

            {uploadError && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {uploadError}
              </div>
            )}
            <FieldError msg={errors.imageUrl?.message} />
            {imageUrl && !uploading && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Image uploaded
              </div>
            )}
          </div>

          {/* Name + description */}
          <div className="sm:col-span-3 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <FieldError msg={errors.name?.message} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span className="text-sm text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Describe the product…"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
              <FieldError msg={errors.description?.message} />
            </div>
          </div>
        </div>

        {/* Price / Category / Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white rounded-2xl border border-gray-100 p-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                $
              </span>
              <input
                {...register('priceDisplay')}
                type="text"
                inputMode="decimal"
                placeholder="29.99"
                className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <FieldError msg={errors.priceDisplay?.message} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              {...register('category')}
              list="categories-list"
              placeholder="Electronics"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <datalist id="categories-list">
              {categoriesData?.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <FieldError msg={errors.category?.message} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              {...register('stock')}
              type="number"
              min={0}
              placeholder="0"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <FieldError msg={errors.stock?.message} />
          </div>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-gradient flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {isEdit ? 'Save Changes' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

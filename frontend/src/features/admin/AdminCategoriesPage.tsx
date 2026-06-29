import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X, ImageIcon, CheckCircle } from 'lucide-react';
import { categoriesApi, type Category } from '../../api/categories';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  description: string;
  imageUrl: string;
}

const EMPTY: FormState = { name: '', description: '', imageUrl: '' };

// ── Field helpers ─────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all';

// ── Modal ─────────────────────────────────────────────────────────────────────
function CategoryModal({
  initial,
  onClose,
  onSave,
  saving,
  saveError,
}: {
  initial: FormState & { id?: string };
  onClose: () => void;
  onSave: (form: FormState, id?: string) => void;
  saving: boolean;
  saveError: string | null;
}) {
  const [form, setForm] = useState<FormState>({
    name: initial.name,
    description: initial.description,
    imageUrl: initial.imageUrl,
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  function set(key: keyof FormState, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.imageUrl.trim()) errs.imageUrl = 'Image URL is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form, initial.id);
  }

  const isEdit = Boolean(initial.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Field label="Category Name *" error={errors.name}>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Electronics"
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short description of this category…"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Image URL *" error={errors.imageUrl}>
            <input
              value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className={inputCls}
            />
          </Field>

          {/* Image preview */}
          {form.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video relative bg-gray-100 dark:bg-gray-800">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {saveError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-gradient flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {isEdit ? 'Save Changes' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({
  name,
  onCancel,
  onConfirm,
  deleting,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-800 animate-fade-in-up">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Category</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{name}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | { id?: string; name: string; description: string; imageUrl: string }>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const createMut = useMutation({
    mutationFn: (form: FormState) => categoriesApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setModal(null); setSaveError(null); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(msg ?? 'Failed to create category');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormState }) => categoriesApi.update(id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setModal(null); setSaveError(null); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(msg ?? 'Failed to update category');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null); },
  });

  function handleSave(form: FormState, id?: string) {
    setSaveError(null);
    if (id) {
      updateMut.mutate({ id, form });
    } else {
      createMut.mutate(form);
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage product categories and their images
          </p>
        </div>
        <button
          onClick={() => { setSaveError(null); setModal(EMPTY); }}
          className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && categories.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No categories yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create your first category to organise products.
          </p>
          <button
            onClick={() => { setSaveError(null); setModal(EMPTY); }}
            className="btn-gradient px-5 py-2 rounded-xl text-sm font-semibold text-white"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map(cat => (
            <div
              key={cat._id}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/600x400/1e1b4b/6366f1?text=' +
                      encodeURIComponent(cat.name);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-0.5">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {cat.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setSaveError(null);
                      setModal({ id: cat._id, name: cat.name, description: cat.description ?? '', imageUrl: cat.imageUrl });
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <CategoryModal
          initial={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
          saveError={saveError}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteMut.mutate(deleteTarget._id)}
          deleting={deleteMut.isPending}
        />
      )}
    </div>
  );
}

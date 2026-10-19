import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Boxes, DollarSign, Edit2, PackageX, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { PageLoader } from "../components/LoadingSpinner";
import { productsAPI } from "../services/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  formatPrice,
  getCategoryName,
  getErrorMessage,
  getId,
  getImage,
  getImages,
  getPrice,
  onImgError,
} from "../utils/format";

const EMPTY_FORM = { name: "", description: "", price: "", stock: "", category: "" };
const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

const StatCard = ({ icon: Icon, label, value, tone = "brand" }) => (
  <div className="card flex items-center gap-4 p-5">
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        tone === "danger"
          ? "bg-danger/15 text-danger-text"
          : tone === "warning"
          ? "bg-warning/15 text-warning-text"
          : "bg-brand/15 text-brand-text"
      }`}
    >
      <Icon size={22} aria-hidden="true" />
    </span>
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-bold text-fg">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all | low | out

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useDocumentTitle("Admin dashboard");

  const load = useCallback(async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data.products || res.data || []);
      setLoadError("");
    } catch (err) {
      setLoadError(getErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Preview URLs for newly selected files (and clean them up).
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const categoryOptions = useMemo(
    () => [...new Set(products.map(getCategoryName).filter(Boolean))].sort(),
    [products]
  );

  const stats = useMemo(() => {
    const low = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
    const out = products.filter((p) => Number(p.stock) <= 0).length;
    const value = products.reduce((s, p) => s + getPrice(p) * (Number(p.stock) || 0), 0);
    return { total: products.length, low, out, value };
  }, [products]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((p) => {
      const stock = Number(p.stock);
      if (stockFilter === "low" && !(stock > 0 && stock <= 5)) return false;
      if (stockFilter === "out" && !(stock <= 0)) return false;
      if (!needle) return true;
      return (
        (p.name || "").toLowerCase().includes(needle) ||
        getCategoryName(p).toLowerCase().includes(needle)
      );
    });
  }, [products, query, stockFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFiles([]);
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: String(getPrice(p) || ""),
      stock: String(p.stock ?? ""),
      category: getCategoryName(p),
    });
    setFiles([]);
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFiles([]);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} images`);
    }
    const tooBig = picked.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      toast.error(`“${tooBig.name}” is larger than ${MAX_SIZE_MB} MB`);
      e.target.value = "";
      return;
    }
    setFiles(picked.slice(0, MAX_FILES));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (Number(form.price) <= 0) return setFormError("Price must be greater than 0");
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 1)
      return setFormError("Stock must be a whole number of at least 1");

    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, String(v).trim()));
      files.forEach((f) => data.append("image", f));

      if (editing) {
        await productsAPI.update(getId(editing), data);
        toast.success("Product updated");
      } else {
        await productsAPI.create(data);
        toast.success("Product added");
      }
      closeForm();
      await load(); // reload so categories/images show exactly as stored
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save the product"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await productsAPI.delete(getId(toDelete));
      setProducts((prev) => prev.filter((p) => getId(p) !== getId(toDelete)));
      toast.success("Product deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete the product"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader message="Loading dashboard…" />;

  return (
    <section className="page-container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-fg">Admin dashboard</h1>
        {!showForm && (
          <button type="button" onClick={openCreate} className="btn btn-primary">
            <Plus size={18} aria-hidden="true" /> Add product
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Boxes} label="Products" value={stats.total} />
        <StatCard icon={DollarSign} label="Inventory value" value={formatPrice(stats.value)} />
        <StatCard icon={AlertTriangle} label="Low stock (≤5)" value={stats.low} tone="warning" />
        <StatCard icon={PackageX} label="Out of stock" value={stats.out} tone="danger" />
      </div>

      {showForm && (
        <motion.form
          onSubmit={handleSubmit}
          className="card mb-8 p-6 sm:p-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-fg">{editing ? "Edit product" : "Add new product"}</h2>
            <button type="button" onClick={closeForm} className="btn btn-ghost !p-2" aria-label="Close form">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Product name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required className="field" />
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <input
                id="category"
                name="category"
                list="category-options"
                value={form.category}
                onChange={handleChange}
                required
                placeholder="e.g. Laptops"
                className="field"
              />
              <datalist id="category-options">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="hint">Must match an existing category.</p>
            </div>
            <div>
              <label htmlFor="price" className="label">Price ($)</label>
              <input id="price" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} required className="field" />
            </div>
            <div>
              <label htmlFor="stock" className="label">Stock quantity</label>
              <input id="stock" name="stock" type="number" step="1" min="1" value={form.stock} onChange={handleChange} required className="field" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="label">Description</label>
              <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} required className="field" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="images" className="label">Images</label>
              <input
                id="images"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleFiles}
                className="block w-full text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-hover"
              />
              <p className="hint">
                Up to {MAX_FILES} images, {MAX_SIZE_MB} MB each (JPG, PNG or WebP).
                {editing && " Choosing new images replaces the current ones."}
              </p>

              {(previews.length > 0 || (editing && getImages(editing).length > 0)) && (
                <ul className="mt-3 flex flex-wrap gap-3">
                  {(previews.length ? previews : getImages(editing, 200)).map((src, i) => (
                    <li key={src + i}>
                      <img src={src} alt="" onError={onImgError} className="h-20 w-20 rounded-lg border border-line object-cover" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger-text">
              {formError}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
            </button>
            <button type="button" onClick={closeForm} disabled={saving} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Product list */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-fg">
          Products <span className="text-base font-medium text-muted">({visible.length})</span>
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or category…"
              aria-label="Search products"
              className="field pl-9 sm:w-64"
            />
          </div>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} aria-label="Filter by stock" className="field sm:w-44">
            <option value="all">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </div>

      {loadError ? (
        <EmptyState
          icon={PackageX}
          title="Couldn’t load products"
          message={loadError}
          action={<button type="button" className="btn btn-primary" onClick={load}>Try again</button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={products.length ? "No matching products" : "No products yet"}
          message={products.length ? "Try a different search or filter." : "Add your first product to get started."}
          action={!products.length && <button type="button" className="btn btn-primary" onClick={openCreate}>Add product</button>}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => {
            const stock = Number(p.stock);
            return (
              <li key={getId(p)} className="card flex flex-col overflow-hidden">
                <img src={getImage(p, 400)} alt={p.name} onError={onImgError} loading="lazy" className="h-40 w-full bg-surface-2 object-cover" />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 font-semibold text-fg">{p.name}</h3>
                  <p className="mt-1 text-lg font-bold text-fg">{formatPrice(getPrice(p))}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span
                      className={`badge ${
                        stock <= 0
                          ? "bg-danger/15 text-danger-text"
                          : stock <= 5
                          ? "bg-warning/15 text-warning-text"
                          : "bg-success/15 text-success-text"
                      }`}
                    >
                      {stock <= 0 ? "Out of stock" : `Stock: ${stock}`}
                    </span>
                    <span className="capitalize text-muted">{getCategoryName(p)}</span>
                  </div>
                  <div className="mt-4 flex gap-2 pt-1">
                    <button type="button" onClick={() => openEdit(p)} className="btn btn-secondary flex-1 !py-2">
                      <Edit2 size={15} aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(p)}
                      className="btn btn-secondary !px-3 !py-2 hover:!text-danger-text"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this product?"
        message={toDelete ? `“${toDelete.name}” will be permanently removed. This can’t be undone.` : ""}
        confirmLabel="Delete product"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
};

export default AdminDashboard;

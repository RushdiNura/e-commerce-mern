import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { productsAPI } from "../services/api";
import { Edit2, Trash2, Plus, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    product: null,
    loading: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
      toast.error("Failed to load products");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);


      if (form.image && form.image.length > 0) {
        Array.from(form.image).forEach((file) => {
          formData.append("image", file);
        });
      }

      let res;
      if (editingProduct) {
        res = await productsAPI.update(editingProduct._id, formData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data.product : p))
        );
        toast.success("Product updated successfully!");
      } else {
        res = await productsAPI.create(formData);
        setProducts((prev) => [...prev, res.data.product]);
        toast.success("Product added successfully!");
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("❌ Error saving product:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to save product. Try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price || product.new_price,
      stock: product.stock,
      category: product.category?.name || product.category || "",
      image: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const showDeleteConfirm = (product) => {
    setDeleteConfirm({
      show: true,
      product: product,
      loading: false,
    });
  };


  const cancelDelete = () => {
    setDeleteConfirm({
      show: false,
      product: null,
      loading: false,
    });
  };


  const confirmDelete = async () => {
    if (!deleteConfirm.product) return;

    setDeleteConfirm((prev) => ({ ...prev, loading: true }));

    try {
      await productsAPI.delete(deleteConfirm.product._id);
      setProducts((prev) =>
        prev.filter((p) => p._id !== deleteConfirm.product._id)
      );
      toast.success(`"${deleteConfirm.product.name}" deleted successfully!`);
      cancelDelete();
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      toast.error("Failed to delete product");
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      image: null,
    });
    setEditingProduct(null);
    setError("");
    setSuccess("");
  };

  // ❌ Cancel edit/create
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h1
          className="text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </motion.h1>


        {!showForm && (
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
            >
              <Plus size={20} />
              Add New Product
            </button>
          </div>
        )}

     
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-lg mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
        
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Laptop, Accessories"
                  required
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 dark:text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter product description..."
                  required
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 dark:text-slate-300 mb-2">
                  Product Images {!editingProduct && "*"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-slate-700 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-sm text-slate-500 mt-1">
                  {editingProduct
                    ? "Select new images to replace existing ones"
                    : "Select one or multiple images"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingProduct ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editingProduct ? "Update Product" : "Add Product"}</>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            {success && <p className="text-green-500 mt-4">{success}</p>}
          </motion.form>
        )}

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
              Products ({products.length})
            </h2>
            {products.length > 0 && (
              <p className="text-slate-500 text-sm">
                Click on products to manage them
              </p>
            )}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 text-lg mb-2">No products yet</p>
              <p className="text-slate-400">
                Add your first product to get started
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <motion.div
                  key={p._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 hover:shadow-xl transition-all group relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => showDeleteConfirm(p)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <img
                    src={
                      p.image?.[0]?.url ||
                      "https://images.unsplash.com/photo-1581093588401-22b6d2d4cf59?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />

                  <h3 className="text-slate-800 dark:text-white font-semibold text-lg mb-2 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-1">
                    ${p.price || p.new_price || "N/A"}
                  </p>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Stock: {p.stock}</span>
                    <span className="capitalize">
                      {p.category?.name || p.category}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2">
                    {p.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Delete Product
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6 pl-15">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-900 dark:text-white">
                    "{deleteConfirm.product?.name}"
                  </strong>
                  ? This will permanently remove the product and all its data.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    disabled={deleteConfirm.loading}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteConfirm.loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleteConfirm.loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;

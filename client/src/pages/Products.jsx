import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Item from "../components/Item";
import { productsAPI } from "../services/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll();
        const data = res.data.products || res.data || [];
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => (cancelled = true);
  }, []);

  
  const getRating = (product) => {
  
    if (product.rating && typeof product.rating === "number") {
      return product.rating;
    }
    if (product.rating && product.rating.average) {
      return product.rating.average;
    }
    if (product.product?.rating?.average) {
      return product.product.rating.average;
    }
    if (product.reviews && Array.isArray(product.reviews)) {
     
      const avg =
        product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        product.reviews.length;
      return isNaN(avg) ? 0 : avg;
    }
    return 0;
  };

  const categories = useMemo(() => {
    const set = new Set();

    products.forEach((p) => {
      let categoryName = "";

      if (typeof p.category === "string") {
        categoryName = p.category.toLowerCase();
      } else if (p.category && typeof p.category === "object") {
        categoryName = (
          p.category.name ||
          p.category.title ||
          ""
        ).toLowerCase();
      } else if (Array.isArray(p.categories)) {
        categoryName = p.categories[0]?.name || p.categories[0] || "";
        if (typeof categoryName === "object") {
          categoryName = categoryName.name || "";
        }
        categoryName = categoryName.toLowerCase();
      } else if (typeof p.categories === "string") {
        categoryName = p.categories.toLowerCase();
      }

      if (categoryName && categoryName !== "[object object]") {
        set.add(categoryName);
      }
    });

    const categoryArray = Array.from(set).filter(
      (cat) => cat && cat !== "[object object]" && cat !== "undefined"
    );

    return ["all", ...categoryArray];
  }, [products]);

  useEffect(() => setCurrentPage(1), [search, category, sort]);

  const getPrice = (p) => p.price ?? p.new_price ?? 0;

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toString().toLowerCase().includes(q) ||
          (p.description || "").toString().toLowerCase().includes(q)
      );
    }

    if (category && category !== "all") {
      list = list.filter((p) => {
        let productCategory = "";

        if (typeof p.category === "string") {
          productCategory = p.category.toLowerCase();
        } else if (p.category && typeof p.category === "object") {
          productCategory = (
            p.category.name ||
            p.category.title ||
            ""
          ).toLowerCase();
        } else if (Array.isArray(p.categories)) {
          productCategory = p.categories[0]?.name || p.categories[0] || "";
          if (typeof productCategory === "object") {
            productCategory = productCategory.name || "";
          }
          productCategory = productCategory.toLowerCase();
        } else if (typeof p.categories === "string") {
          productCategory = p.categories.toLowerCase();
        }

        return productCategory === category;
      });
    }

    if (sort === "lowToHigh") {
      list.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "highToLow") {
      list.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sort === "rating") {
      list.sort((a, b) => getRating(b) - getRating(a));
    }

    return list;
  }, [products, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePage = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Loading products…</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <section className="max-w-7xl mx-auto px-6 py-0">
      <motion.h1
        className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        Explore Our Products
      </motion.h1>

      <motion.div
        className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white/90 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <input
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-yellow-400"
          placeholder="Search products or descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          value={category || "all"}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all"
                ? "All Categories"
                : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort by</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </motion.div>

      {paginated.length > 0 ? (
        <motion.div
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {paginated.map((p, i) => (
            <motion.div
              key={p._id ?? p.id ?? i}
              whileHover={{ scale: 1.03, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Item
                {...p}
                new_price={p.price ?? p.new_price}
                image={p.image}
                rating={getRating(p)} 
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-center text-slate-500 mt-12">No products found.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Products;

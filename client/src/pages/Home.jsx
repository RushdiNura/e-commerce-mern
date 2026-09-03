import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Item from "../components/Item";
import { productsAPI } from "../services/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll({ limit: 20 });
        const data = res.data.products || res.data || [];
        if (!cancelled) {
          const sortedByRating = [...data].sort(
            (a, b) => getRating(b) - getRating(a)
          );
          setFeatured(sortedByRating.slice(0, 4));

          const setCats = new Set();
          data.forEach((p) => {
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
              setCats.add(categoryName);
            }
          });

          const categoryArray = Array.from(setCats).filter(
            (cat) => cat && cat !== "[object object]" && cat !== "undefined"
          );

          setCategories(categoryArray);
        }
      } catch (err) {
        console.error(err);
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

  return (
    <>
  
      <section className="relative w-full bg-slate-900 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Upgrade Your Tech,{" "}
            <span className="text-yellow-400">Empower Your Life</span>
          </motion.h1>
          <motion.p
            className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Discover premium laptops, gadgets, and accessories at unbeatable
            prices.
          </motion.p>
        </div>
      </section>

      {/* <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Shop by category
        </h2>
        <div className="flex gap-4 flex-wrap">
          {loading ? (
            <p className="text-slate-500">Loading categories…</p>
          ) : categories.length ? (
            categories.map((c) => (
              <span
                key={c}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors capitalize"
              >
                {c}
              </span>
            ))
          ) : (
            <p className="text-slate-500">No categories available.</p>
          )}
        </div>
      </section> */}

      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Featured Products
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.length ? (
            featured.map((p, i) => (
              <motion.div
                key={p._id ?? p.id ?? i}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <Item
                  {...p}
                  new_price={p.price ?? p.new_price}
                  rating={getRating(p)}
                />
              </motion.div>
            ))
          ) : (
            <p className="text-slate-500">No featured products available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;

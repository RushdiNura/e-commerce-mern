import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Shield, Truck } from "lucide-react";
import Item from "../components/Item";
import { ProductGridSkeleton } from "../components/Skeletons";
import { productsAPI } from "../services/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useSlowLoading from "../hooks/useSlowLoading";
import { getCategoryName, getId, getRating } from "../utils/format";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const PERKS = [
  { icon: Truck, title: "Free shipping", text: "On every order" },
  { icon: Shield, title: "1 year warranty", text: "On all products" },
  { icon: RefreshCw, title: "30-day returns", text: "Hassle-free" },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const slow = useSlowLoading(loading);

  useDocumentTitle();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productsAPI.getAll();
        if (!cancelled) setProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(
    () => [...products].sort((a, b) => getRating(b) - getRating(a)).slice(0, 4),
    [products]
  );

  const categories = useMemo(() => {
    const names = new Set(products.map(getCategoryName).filter(Boolean));
    return [...names].sort();
  }, [products]);

  return (
    <>
      {/* Hero — always dark with light text, independent of the theme */}
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/40 to-slate-900" />
        <div className="page-container py-20 text-center sm:py-28">
          <motion.h1
            className="text-4xl font-extrabold leading-tight sm:text-6xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Upgrade your tech,{" "}
            <span className="text-yellow-400">empower your life</span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
          >
            Premium laptops, headphones, smartwatches and accessories at prices that make sense.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <Link to="/products" className="btn btn-accent btn-lg">
              Shop now <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="page-container -mt-6 relative z-10">
        <ul className="card grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-text">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-fg">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-container pt-12">
          <h2 className="mb-4 text-2xl font-bold text-fg">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c}
                to={`/products?category=${encodeURIComponent(c)}`}
                className="card px-5 py-2.5 text-sm font-semibold capitalize text-fg transition-colors hover:border-brand hover:text-brand-text"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="page-container py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-fg sm:text-3xl">Top rated products</h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-text hover:underline"
          >
            View all <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <>
            <ProductGridSkeleton count={4} />
            {slow && (
              <p className="mt-6 text-center text-sm text-muted" role="status">
                Waking up the server — the first load can take up to a minute. Thanks for waiting!
              </p>
            )}
          </>
        ) : error ? (
          <p className="card p-8 text-center text-muted" role="alert">
            We couldn’t load products right now. Please refresh the page in a moment.
          </p>
        ) : featured.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <motion.div
                key={getId(p) ?? i}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: i * 0.05 }}
              >
                <Item product={p} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="card p-8 text-center text-muted">No products available yet.</p>
        )}
      </section>
    </>
  );
};

export default Home;

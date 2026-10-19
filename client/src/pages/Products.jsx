import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";
import Item from "../components/Item";
import EmptyState from "../components/EmptyState";
import { ProductGridSkeleton } from "../components/Skeletons";
import { productsAPI } from "../services/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useSlowLoading from "../hooks/useSlowLoading";
import { PAGE_SIZE } from "../config";
import { getCategoryName, getId, getPrice, getRating } from "../utils/format";

// The filters live in the URL (?q=&category=&sort=&page=) so that the back
// button, refresh and shared links all keep working.
const Products = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = (params.get("category") || "").toLowerCase();
  const sort = params.get("sort") || "default";
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(q);
  const slow = useSlowLoading(loading);

  useDocumentTitle("Products");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error(err);
      setError("We couldn’t load the products. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Uses the functional form so a delayed (debounced) update never overwrites
  // a filter the user changed in the meantime.
  const update = (changes, { resetPage = true } = {}) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([k, v]) => {
          if (v === "" || v == null || v === "default" || v === "all") next.delete(k);
          else next.set(k, String(v));
        });
        if (resetPage) next.delete("page");
        return next;
      },
      { replace: true }
    );
  };

  // Debounce the search box so we don't re-filter on every keystroke.
  const lastPushed = useRef(q);
  useEffect(() => {
    const t = setTimeout(() => {
      const value = search.trim();
      if (value !== q) {
        lastPushed.current = value;
        update({ q: value });
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Keep the box in sync when the URL changes from elsewhere (back button, links).
  useEffect(() => {
    if (q !== lastPushed.current) {
      lastPushed.current = q;
      setSearch(q);
    }
  }, [q]);

  const categories = useMemo(() => {
    const names = new Set(products.map((p) => getCategoryName(p).toLowerCase()).filter(Boolean));
    return [...names].sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(needle) ||
          (p.description || "").toLowerCase().includes(needle)
      );
    }
    if (category) list = list.filter((p) => getCategoryName(p).toLowerCase() === category);
    if (sort === "lowToHigh") list.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sort === "highToLow") list.sort((a, b) => getPrice(b) - getPrice(a));
    else if (sort === "rating") list.sort((a, b) => getRating(b) - getRating(a));
    return list;
  }, [products, q, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(q || category || sort !== "default");

  const goToPage = (p) => {
    update({ page: p }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    lastPushed.current = "";
    setSearch("");
    setParams({}, { replace: true });
  };

  // Compact page list: 1 … 4 5 6 … 12
  const pageNumbers = useMemo(() => {
    const set = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => {
      if (i > 0 && n - nums[i - 1] > 1) out.push("gap-" + n);
      out.push(n);
    });
    return out;
  }, [currentPage, totalPages]);

  return (
    <section className="page-container py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-fg">Products</h1>
        {!loading && !error && (
          <p className="mt-1 text-sm text-muted" aria-live="polite">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
            {hasFilters ? " match your filters" : ""}
          </p>
        )}
      </header>

      {/* Filters */}
      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="field pl-10"
          />
        </div>

        <select
          value={category || "all"}
          onChange={(e) => update({ category: e.target.value })}
          aria-label="Filter by category"
          className="field sm:w-52"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          aria-label="Sort products"
          className="field sm:w-52"
        >
          <option value="default">Sort by</option>
          <option value="lowToHigh">Price: low to high</option>
          <option value="highToLow">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>

        {hasFilters && (
          <button type="button" onClick={clearFilters} className="btn btn-ghost whitespace-nowrap">
            <X size={16} aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <>
          <ProductGridSkeleton count={8} />
          {slow && (
            <p className="mt-6 text-center text-sm text-muted" role="status">
              Waking up the server — the first load can take up to a minute. Thanks for waiting!
            </p>
          )}
        </>
      ) : error ? (
        <EmptyState
          icon={SearchX}
          title="Couldn’t load products"
          message={error}
          action={
            <button type="button" className="btn btn-primary" onClick={load}>
              Try again
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No products found"
          message={
            hasFilters
              ? "Try a different search or remove some filters."
              : "There are no products yet. Please check back soon."
          }
          action={
            hasFilters && (
              <button type="button" className="btn btn-primary" onClick={clearFilters}>
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p, i) => (
            <Item key={getId(p) ?? i} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && !error && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            className="btn btn-secondary !px-3"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {pageNumbers.map((n) =>
            typeof n === "string" ? (
              <span key={n} className="px-1 text-muted" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => goToPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={`btn !px-3.5 ${n === currentPage ? "btn-primary" : "btn-secondary"}`}
              >
                {n}
              </button>
            )
          )}
          <button
            type="button"
            className="btn btn-secondary !px-3"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </section>
  );
};

export default Products;

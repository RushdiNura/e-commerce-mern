import React from "react";

const Filters = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
   
      <input
        type="text"
        placeholder="🔍 Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none transition"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full md:w-1/4 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-yellow-400 outline-none transition"
      >
        <option value="">All Categories</option>
        <option value="laptops">Laptops</option>
        <option value="headphones">Headphones</option>
        <option value="accessories">Accessories</option>
        <option value="smartwatch">Smartwatches</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="w-full md:w-1/4 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-yellow-400 outline-none transition"
      >
        <option value="default">Sort By</option>
        <option value="lowToHigh">Price: Low to High</option>
        <option value="highToLow">Price: High to Low</option>
      </select>
    </div>
  );
};

export default Filters;

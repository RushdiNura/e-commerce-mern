import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Item = ({ id,_id, name, image, old_price, new_price, product }) => {
  const { addToCart } = useCart();

  // const discount =
  //   old_price && old_price > new_price
  //     ? Math.round(((old_price - new_price) / old_price) * 100)
  //     : 0;

const handleAddToCart = async (e) => {
  e.preventDefault();
  try {
    const pid = _id ?? id ?? (product && product._id);
    await addToCart({
      productId: pid,
      quantity: 1,
    });
  } catch (err) {
    console.error("Add to cart failed:", err);
  }
};



  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

      <div className="relative overflow-hidden">
        <Link to={`/product/${_id ?? id ?? (product && product._id)}`}>
          <img
            src={
              Array.isArray(image)
                ? image[0]?.url
                : image?.url ||
                  image ||
                  "https://images.unsplash.com/photo-1581093588401-22b6d2d4cf59?auto=format&fit=crop&w=600&q=80"
            }
            alt={name}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            -{discount}%
          </span>
        )} */}

        {/* 🛒 Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          aria-label="Add to cart"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <Link to={`/products/${_id ?? id ?? (product && product._id)}`}>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            ${new_price}
          </span>
          {old_price && (
            <span className="text-sm text-slate-500 line-through">
              ${old_price}
            </span>
          )}
        </div>

        {/* ⭐ Ratings */}
        <div className="flex items-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product?.rating?.average || 0)
                    ? "fill-current"
                    : "stroke-current"
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-slate-500 ml-1">
            ({product?.rating?.count || 0})
          </span>
        </div>
      </div>
    </div>
  );
};

export default Item;

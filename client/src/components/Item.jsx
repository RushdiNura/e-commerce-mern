import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Stars from "./Stars";
import {
  formatPrice,
  getCategoryName,
  getId,
  getImage,
  getPrice,
  getRating,
  getReviewCount,
  onImgError,
} from "../utils/format";

// Product card. Pass the whole product object: <Item product={p} />
const Item = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const id = getId(product);
  const price = getPrice(product);
  const oldPrice = Number(product.old_price) || 0;
  const category = getCategoryName(product);
  const outOfStock = product.stock !== undefined && Number(product.stock) <= 0;
  const lowStock = !outOfStock && product.stock !== undefined && Number(product.stock) <= 5;
  const reviews = getReviewCount(product);

  const handleAdd = async () => {
    if (!user) {
      toast("Please log in to add items to your cart");
      navigate("/login", { state: { from: location } });
      return;
    }
    await addToCart({ productId: id, quantity: 1, name: product.name });
  };

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <Link
        to={`/product/${id}`}
        className="relative block overflow-hidden bg-surface-2"
        aria-label={`View ${product.name}`}
      >
        <img
          src={getImage(product)}
          alt={product.name}
          loading="lazy"
          onError={onImgError}
          className={`h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            outOfStock ? "opacity-60" : ""
          }`}
        />
        {outOfStock && (
          <span className="badge absolute left-3 top-3 bg-slate-900 text-white">Out of stock</span>
        )}
        {lowStock && (
          <span className="badge absolute left-3 top-3 bg-accent text-accent-fg">
            Only {product.stock} left
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {category && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-text">
            {category}
          </p>
        )}
        <Link to={`/product/${id}`}>
          <h3 className="line-clamp-2 min-h-[2.75rem] font-semibold leading-snug text-fg transition-colors group-hover:text-brand-text">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <Stars value={getRating(product)} size={14} />
          <span className="text-xs text-muted">({reviews})</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-fg">{formatPrice(price)}</span>
          {oldPrice > price && (
            <span className="text-sm text-muted line-through">{formatPrice(oldPrice)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn btn-primary mt-4 w-full"
        >
          <ShoppingCart size={16} aria-hidden="true" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
};

export default Item;

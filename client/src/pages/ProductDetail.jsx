import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productsAPI, ratingAPI, ordersAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Star,
  Send,
  Edit3,
  Trash2,
  CheckCircle,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Invalid product ID in URL.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getById(id);
        const productData = res.data.product || res.data;
        setProduct(productData);

        if (productData.reviews) {
          setReviews(productData.reviews);
        }

        if (user) {
          await checkPurchaseStatus(productData._id);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("❌ Could not load product details.");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const checkPurchaseStatus = async (productId) => {
    try {
      const ordersRes = await ordersAPI.getUserOrders();
      const hasBought =
        ordersRes.data.orders?.some((order) =>
          order.items?.some(
            (item) =>
              item.product?._id === productId || item.product === productId
          )
        ) || false;
      setHasPurchased(hasBought);
    } catch (error) {
      console.error("Error checking purchase status:", error);
    }
  };


  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({
        productId: product._id ?? product.id,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart! 🛒`, {
        duration: 3000,
        icon: "✅",
        style: {
          background: "#10b981",
          color: "white",
        },
      });
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add item to cart ❌", {
        duration: 4000,
        style: {
          background: "#ef4444",
          color: "white",
        },
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }


    if (!hasPurchased) {
      const proceed = window.confirm(
        "You haven't purchased this product yet. Are you sure you want to submit a review?"
      );
      if (!proceed) return;
    }

    setReviewLoading(true);
    try {

      const newReview = {
        _id: Date.now().toString(),
        user: { _id: user._id, name: user.name || user.username },
        userName: user.name || user.username,
        rating,
        comment: comment.trim(),
        verifiedPurchase: hasPurchased,
        createdAt: new Date().toISOString(),
      };

      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);

      // Update product rating
      const newRating =
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
        updatedReviews.length;
      setProduct((prev) => ({
        ...prev,
        rating: {
          average: newRating,
          count: updatedReviews.length,
        },
      }));

      // Reset form
      setRating(0);
      setComment("");

      toast.success(
        hasPurchased
          ? "✅ Verified review added!"
          : "Review added successfully! ⭐",
        {
          duration: 4000,
          icon: hasPurchased ? "🛒" : "⭐",
        }
      );
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    setReviewLoading(true);
    try {
      const updatedReviews = reviews.map((review) =>
        review._id === editingReview._id
          ? {
              ...review,
              rating,
              comment: comment.trim(),
              updatedAt: new Date().toISOString(),
            }
          : review
      );

      setReviews(updatedReviews);


      const newRating =
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
        updatedReviews.length;
      setProduct((prev) => ({
        ...prev,
        rating: {
          average: newRating,
          count: updatedReviews.length,
        },
      }));

      setEditingReview(null);
      setRating(0);
      setComment("");
      toast.success("Review updated successfully! ✏️");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const updatedReviews = reviews.filter(
        (review) => review._id !== reviewId
      );
      setReviews(updatedReviews);

      const newRating =
        updatedReviews.length > 0
          ? updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
            updatedReviews.length
          : 0;
      setProduct((prev) => ({
        ...prev,
        rating: {
          average: newRating,
          count: updatedReviews.length,
        },
      }));

      toast.success("Review deleted successfully! 🗑️");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (
    currentRating,
    onRate = null,
    onHover = null,
    size = 20
  ) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-all ${
            starValue <= (onHover ? hoverRating : currentRating)
              ? "text-yellow-400 transform scale-110"
              : "text-gray-300"
          } ${onRate ? "cursor-pointer hover:scale-125" : "cursor-default"}`}
          onClick={() => onRate && onRate(starValue)}
          onMouseEnter={() => onHover && onHover(starValue)}
          onMouseLeave={() => onHover && onHover(0)}
          disabled={!onRate}
        >
          <Star
            size={size}
            className={
              starValue <= (onHover ? hoverRating : currentRating)
                ? "fill-current"
                : ""
            }
          />
        </button>
      );
    });
  };

  const calculateRatingStats = () => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      stats[review.rating]++;
    });
    return stats;
  };

  const ratingStats = calculateRatingStats();
  const userReview = reviews.find((review) => review.user?._id === user?._id);
  const currentRating =
    product?.rating?.average ||
    product?.rating ||
    reviews.reduce((sum, review) => sum + review.rating, 0) /
      (reviews.length || 1);
  const reviewCount = reviews.length;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-300 text-lg">
            Loading product details...
          </p>
        </div>
      </div>
    );

  if (error || !product)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 text-lg font-semibold mb-4">
            {error || "Product not found."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  let imageUrl = "";
  if (product?.image) {
    if (Array.isArray(product.image) && product.image.length > 0) {
      imageUrl = product.image[0].url || product.image[0];
    } else if (typeof product.image === "object" && product.image.url) {
      imageUrl = product.image.url;
    } else if (typeof product.image === "string") {
      imageUrl = product.image.startsWith("http")
        ? product.image
        : `${BASE_URL}${product.image.startsWith("/") ? "" : "/"}${
            product.image
          }`;
    }
  }

  if (!imageUrl) {
    imageUrl =
      "https://images.unsplash.com/photo-1581093588401-22b6d2d4cf59?auto=format&fit=crop&w=600&q=80";
  }

  const discount =
    product.old_price && product.old_price > product.new_price
      ? Math.round(
          ((product.old_price - product.new_price) / product.old_price) * 100
        )
      : 0;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        className="grid md:grid-cols-2 gap-12 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 mb-12"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.div
          className="relative bg-slate-50 dark:bg-slate-800 flex justify-center items-center p-6"
          variants={fadeUp}
        >
          <img
            src={imageUrl}
            alt={product.name}
            className="rounded-2xl shadow-lg w-full h-[450px] object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1581093588401-22b6d2d4cf59?auto=format&fit=crop&w=600&q=80";
            }}
          />
          {discount > 0 && (
            <span className="absolute top-6 right-6 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
              -{discount}%
            </span>
          )}
        </motion.div>

        <motion.div
          className="p-8 flex flex-col justify-center"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {renderStars(currentRating, null, null, 24)}
            </div>
            <span className="text-lg text-slate-600 dark:text-slate-300 font-semibold">
              {currentRating.toFixed(1)}
            </span>
            {reviewCount > 0 && (
              <span className="text-slate-500">
                • {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              $
              {product.price?.toFixed(2) ||
                product.new_price?.toFixed(2) ||
                "0.00"}
            </span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-xl text-slate-400 line-through">
                ${product.old_price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
            {product.description || "No description provided."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Shield size={18} className="text-green-500" />
              <span className="text-sm">1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Truck size={18} className="text-blue-500" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <RefreshCw size={18} className="text-purple-500" />
              <span className="text-sm">30-Day Returns</span>
            </div>
          </div>

          <div className="space-y-4">
            {product.stock !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock > 10
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : product.stock > 0
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {product.stock > 10
                    ? "✅ In Stock"
                    : product.stock > 0
                    ? `⚠️ Low Stock (${product.stock} left)`
                    : "❌ Out of Stock"}
                </span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                (product.stock !== undefined && product.stock === 0) ||
                !user
              }
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 text-white px-8 py-4 rounded-xl font-semibold shadow-lg w-full justify-center"
            >
              {addingToCart ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {!user
                    ? "Login to Add to Cart"
                    : product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Customer Reviews
        </h2>


        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
              {currentRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(currentRating, null, null, 20)}
            </div>
            <div className="text-sm text-slate-500">
              {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300 w-4">
                    {star}
                  </span>
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          reviewCount > 0
                            ? (ratingStats[star] / reviewCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-500 w-8 text-right">
                    {reviewCount > 0
                      ? Math.round((ratingStats[star] / reviewCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {user && !userReview && !editingReview && (
          <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Add Your Review</h3>

            {hasPurchased && (
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Verified Purchase</span>
              </div>
            )}

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Rating *
                </label>
                <div className="flex">
                  {renderStars(rating, setRating, setHoverRating)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    hasPurchased
                      ? "Share your experience with this product. What did you like? What could be improved?"
                      : "Tell us what you think about this product..."
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows="4"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>

                {!hasPurchased && (
                  <span className="text-sm text-slate-500 text-right">
                    💡 Consider purchasing to add a verified review
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {editingReview && (
          <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
            <h3 className="text-lg font-semibold mb-4">Edit Your Review</h3>
            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Rating *
                </label>
                <div className="flex">
                  {renderStars(rating, setRating, setHoverRating)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows="4"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  {reviewLoading ? "Updating..." : "Update Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReview(null);
                    setRating(0);
                    setComment("");
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {review.userName}
                    </h4>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <CheckCircle size={12} />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(review.rating, null, null, 16)}
                    </div>
                    <span className="text-sm text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {user && review.user?._id === user._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {review.comment}
              </p>

              {review.updatedAt && review.updatedAt !== review.createdAt && (
                <p className="text-xs text-slate-500 mt-2">
                  Updated on {new Date(review.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Star
                size={64}
                className="mx-auto mb-4 text-slate-300 opacity-50"
              />
              <p className="text-xl mb-2 font-semibold">No reviews yet</p>
              <p className="text-sm max-w-md mx-auto">
                Be the first to share your experience with this product!
                {user && " Purchase the item to add a verified review."}
              </p>
              {!user && (
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Login to Review
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default ProductDetail;

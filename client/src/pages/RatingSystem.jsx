
import React, { useState, useEffect } from "react";
import { Star, Send, Edit3, Trash2 } from "lucide-react";
import { ratingAPI } from "../services/api";
import toast from "react-hot-toast";

const RatingSystem = ({ productId, user, onRatingUpdate }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const res = await ratingAPI.getReviews(productId);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.rating || 0);
      setNumReviews(res.data.numReviews || 0);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const handleSubmitReview = async (e) => {
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

    setLoading(true);
    try {
      if (editingReview) {
        await ratingAPI.updateReview(productId, editingReview._id, {
          rating,
          comment,
        });
        toast.success("Review updated successfully");
        setEditingReview(null);
      } else {
        await ratingAPI.addReview(productId, {
          rating,
          comment,
        });
        toast.success("Review added successfully");
      }

      setRating(0);
      setComment("");

      await loadReviews();

      if (onRatingUpdate) {
        onRatingUpdate(averageRating, numReviews + (editingReview ? 0 : 1));
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(0);
    setComment("");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await ratingAPI.deleteReview(productId, reviewId);
      toast.success("Review deleted successfully");
      await loadReviews();

      if (onRatingUpdate) {
        onRatingUpdate(averageRating, numReviews - 1);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const renderStars = (currentRating, onRate, onHover, size = 20) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-colors ${
            starValue <= (hoverRating || currentRating)
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
          onClick={() => onRate && onRate(starValue)}
          onMouseEnter={() => onHover && onHover(starValue)}
          onMouseLeave={() => onHover && onHover(0)}
          disabled={!onRate}
        >
          <Star
            size={size}
            className={
              starValue <= (hoverRating || currentRating) ? "fill-current" : ""
            }
          />
        </button>
      );
    });
  };

  const userReview = reviews.find((review) => review.user?._id === user?._id);

  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-1">
              {renderStars(averageRating, null, null, 16)}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {numReviews} review{numReviews !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {user && !userReview && !editingReview && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-semibold mb-4">Add Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {editingReview && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-semibold mb-4">Edit Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
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
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? "Updating..." : "Update Review"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white">
                  {review.userName}
                </h5>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {renderStars(review.rating, null, null, 16)}
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {user && review.user?._id === user._id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="p-1 text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-slate-700 dark:text-slate-300">
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
          <div className="text-center py-8 text-slate-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;

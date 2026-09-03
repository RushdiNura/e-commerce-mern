// routes/rating.js
import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/ratingController.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// Add review
router.post("/products/:productId/reviews", verifyUser, addReview);

// Get product reviews
router.get("/products/:productId/reviews", getProductReviews);

// Update review
router.put("/products/:productId/reviews/:reviewId", verifyUser, updateReview);

// Delete review
router.delete("/products/:productId/reviews/:reviewId", verifyUser, deleteReview);

export default router;

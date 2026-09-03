import express from 'express'
import {getAllProducts,createProduct,getProductById,deleteProduct,updateProduct} from '../controllers/productController.js';
import {
  createReview,
  deleteReview,
  getProductReviews,
} from "../controllers/reviewController.js";
import { verifyUser,authorize } from '../middleware/auth.js';
import  upload  from "../middleware/upload.js";

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', verifyUser, authorize('admin'), upload.array('image', 5), createProduct);
router.put('/:id', verifyUser, authorize('admin'),upload.array('image',5), updateProduct);
router.delete('/:id', verifyUser, authorize('admin'), deleteProduct);

router.post("/:id/reviews", createReview);
router.get("/:id/reviews", getProductReviews);


router.delete("/:id/reviews/:reviewId", authorize("admin"), deleteReview);

export default router;
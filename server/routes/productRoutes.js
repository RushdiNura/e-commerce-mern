import express from 'express'
import {getAllProducts,createProduct,getProductById,deleteProduct,updateProduct} from '../controllers/productController.js';
import { verifyUser,authorize } from '../middleware/auth.js';
import  upload  from "../middleware/upload.js";

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', verifyUser, authorize('admin'), upload.array('image', 5), createProduct);
router.put('/:id', verifyUser, authorize('admin'),upload.array('image',5), updateProduct);
router.delete('/:id', verifyUser, authorize('admin'), deleteProduct);

// NOTE: review routes live in routes/rating.js (authenticated). The old duplicates
// here were registered first and shadowed them, which broke posting/deleting reviews.

export default router;
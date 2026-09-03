import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { authorize, verifyUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyUser, authorize("admin"), createCategory);
router.put("/:id", verifyUser, authorize("admin"), updateCategory);
router.delete("/:id", verifyUser, authorize("admin"), deleteCategory);

export default router;

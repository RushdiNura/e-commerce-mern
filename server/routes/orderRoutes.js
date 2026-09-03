import express from "express";
import {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { markOrderAsPaid } from "../controllers/paymentController.js";
import { authorize, verifyUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyUser, createOrder);
router.get("/my-orders", verifyUser, getUserOrders);


router.put("/:id/status", verifyUser, authorize("admin"), updateOrderStatus);
router.delete("/:id", verifyUser, authorize("admin"), deleteOrder);

export default router;

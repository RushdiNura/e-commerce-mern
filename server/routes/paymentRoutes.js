import express from "express";
import { createPaymentIntent, markOrderAsPaid } from "../controllers/paymentController.js";
import { authorize, verifyUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-payment-intent",verifyUser,authorize("admin"), createPaymentIntent);

router.put("/order/:id/mark-paid",verifyUser,authorize("admin"),markOrderAsPaid);

export default router;

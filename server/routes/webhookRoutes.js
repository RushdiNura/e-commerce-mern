import express from "express";
const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  (req, res) => {
    req.rawBody = req.body;
    req.body = {}; 
    import("../controllers/webhookController.js").then(module => {
      module.stripeWebhook(req, res);
    });
  }
);

export default router;
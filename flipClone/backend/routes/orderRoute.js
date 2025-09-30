// routes/paymentRoutes.js
import express from "express";
import { createCashfreeOrder } from "../controllers/order/paymentController.js";
import { cashfreeWebhook } from "../controllers/order/webhook.js";
import { requireSignIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/cashfree/create-order",requireSignIn, createCashfreeOrder);
router.post("/cashfree/webhook", requireSignIn, cashfreeWebhook); // ensure rawBody capture in app.js

export default router;

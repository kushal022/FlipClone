// routes/paymentRoutes.js
import express from "express";
import { createCashfreeOrder } from "../controllers/order/paymentController.js";
import { cashfreeWebhook } from "../controllers/order/webhook.js";
import { requireSignIn } from "../middleware/authMiddleware.js";
import { getUserOrders } from "../controllers/order/getOrders.user.js";
import { verifyCashfreeOrder } from "../controllers/order/verifyPayment.js";

const router = express.Router();

router.post("/cashfree/create-order",requireSignIn, createCashfreeOrder);
router.post("/cashfree/webhook", cashfreeWebhook); // ensure rawBody capture in app.js

router.get("/status/:order_id",requireSignIn, verifyCashfreeOrder);

router.get('/', requireSignIn, getUserOrders);
export default router;

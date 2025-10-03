// routes/paymentRoutes.js
import express from "express";
import { createCashfreeOrder } from "../controllers/order/paymentController.js";
import { cashfreeWebhook } from "../controllers/order/webhook.js";
import { requireSignIn } from "../middleware/authMiddleware.js";
import { getUserOrders } from "../controllers/order/getOrders.user.js";
import { verifyCashfreeOrder } from "../controllers/order/verifyPayment.js";
import { getOrderById } from "../controllers/order/getSingleOrder.user.js";

const router = express.Router();

router.post("/cashfree/create-order",requireSignIn, createCashfreeOrder);
router.post("/cashfree/webhook", cashfreeWebhook); // ensure rawBody capture in app.js

router.get("/status/:order_id",requireSignIn, verifyCashfreeOrder);

// Get all orders for user:
router.get('/', requireSignIn, getUserOrders);
// Get Single order for user: order by id
router.get('/order_details/:orderId', requireSignIn, getOrderById)
export default router;

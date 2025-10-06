// routes/paymentRoutes.js
import express from "express";
import { createCashfreeOrder } from "../controllers/order/paymentController.js";
import { cashfreeWebhook } from "../controllers/order/webhook.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import { getUserOrders } from "../controllers/order/getOrders.user.js";
import { verifyCashfreeOrder } from "../controllers/order/verifyPayment.js";
import { getOrderById } from "../controllers/order/getSingleOrder.user.js";
import { updateCartAndProductCtrl } from "../controllers/order/updateCart_Product.js";
import { getSellerDashboardStats, getSellerOrderDetails, getSellerOrders, updateSellerOrderStatus } from "../controllers/order/getAdminOrder.js";

const router = express.Router();

router.post("/cashfree/create-order",requireSignIn, createCashfreeOrder);
router.post("/cashfree/webhook", cashfreeWebhook); // ensure rawBody capture in app.js

router.get("/status/:order_id",requireSignIn, verifyCashfreeOrder);

// Get all orders for user:
router.get('/', requireSignIn, getUserOrders);
// Get Single order for user: order by id
router.get('/order_details/:orderId', requireSignIn, getOrderById)

// Update Cart and Stock:
router.post('/update_cart_stock', requireSignIn, updateCartAndProductCtrl)


//? Admin Order routes:
router.get('/admin-orders', isAdmin, getSellerOrders);
router.get('/admin-order-details/:orderId', isAdmin, getSellerOrderDetails);
router.patch('/update/order-status/:orderId', isAdmin, updateSellerOrderStatus);
router.get('/order-stat/', isAdmin, getSellerDashboardStats);



export default router;

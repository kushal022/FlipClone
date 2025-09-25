import express from 'express';
import { addToCartController, decQuantityController } from '../controllers/cart/addUpdate.js';
import { removeFromCartController } from '../controllers/cart/remove.js';
import { requireSignIn } from '../middleware/authMiddleware.js';
import { getCartController } from '../controllers/cart/getCart.js';
const router = express.Router();

// Create and Update route:
router.post("/add-to-cart", requireSignIn, addToCartController);
// Remove item from carts items:
router.post("/remove-from-cart", requireSignIn, removeFromCartController);
// Get Cart route:
router.get("/get", requireSignIn, getCartController);
// Decrease Quantity cart item:
router.post("/dec-quantity", requireSignIn, decQuantityController)

export default router;
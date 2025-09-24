import express from 'express';
import { addToCartController } from '../controllers/cart/addUpdate.js';
import { removeFromCartController } from '../controllers/cart/remove.js';
const router = express.Router();

// Create and Update route:
router.post("/addToCart", addToCartController);
// Remove item from carts items:
router.post("/remove-from-cart", removeFromCartController);

export default router;
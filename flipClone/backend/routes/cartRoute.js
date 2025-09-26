import express from 'express';
import { addToCartController, decQuantityController } from '../controllers/cart/addUpdate.js';
import { removeFromCartController } from '../controllers/cart/remove.js';
import { requireSignIn } from '../middleware/authMiddleware.js';
import { getCartController } from '../controllers/cart/getCart.js';
import { moveToCartController, removeSavedItemController, saveForLaterController } from '../controllers/cart/addSaveForLater.js';
const router = express.Router();

// Create and Update route:
router.post("/add-to-cart", requireSignIn, addToCartController);
// Remove item from carts items:
router.post("/remove-from-cart", requireSignIn, removeFromCartController);
// Get Cart route:
router.get("/get", requireSignIn, getCartController);
// Decrease Quantity cart item:
router.post("/dec-quantity", requireSignIn, decQuantityController)

// Add to SaveForLater:
router.post("/save-for-later", requireSignIn, saveForLaterController);
// Move item Saved To Cart items:
router.post("/move-to-cart", requireSignIn, moveToCartController);
// Remove/Delete From saved items
router.post("/remove-saved", requireSignIn, removeSavedItemController);

export default router;
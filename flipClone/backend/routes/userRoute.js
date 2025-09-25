import express from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import updateWishlistController from "../controllers/user/updateWishlist.js";
import getWishlistItemsController from "../controllers/user/getWishlistItems.js";
const router = express.Router();


// Getting Wishlist items:
router.get("/wishlist", requireSignIn, getWishlistItemsController);
// Updating Wishlist items:
router.post("/update-wishlist", requireSignIn, updateWishlistController)


export default router;
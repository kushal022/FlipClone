import { createError } from "../../middleware/errorHandler.js";
import userModel from "../../models/userModel.js";

// Get Wishlist items Controller:
const getWishlistItemsController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId);
        // console.log(user);
        const wishlistItems = user.wishlist;
        // console.log(wishlistItems);
        return res.status(201).send({
            success: true,
            data: wishlistItems,
            message: "Wishlist items fetched successfully"
        });
    } catch (error) {
        next(createError(500, error, "Error in getting Wishlist items"))
    }
};
export default getWishlistItemsController;

import userModel from "../../models/userModel.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";
import { createError } from "../../middleware/errorHandler.js";

// Get Wishlist's Products Based on Query: Controller
const getWishlistProductsController = async (req, res, next) => {
    try {
        const { user } = req;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5; // items per page

        // Calculate the skip value based on the page number
        const skip = (page - 1) * pageSize;

        // Fetch the total count of wishlist items
        const userWishlistCount = await userModel
            .findById(user._id)
            .select("wishlist")
            .lean();
            const totalItems = userWishlistCount?.wishlist?.length || 0;
            
            // Fetch wishlist items for the user with pagination
            const userWithWishlist = await userModel.findById(user._id).populate({
                path: "wishlist", // Populate the "wishlist" field with product details
                options: { skip, limit: pageSize }, // Apply pagination
                model: productModel,
            });
            
            const wishlistItems = userWithWishlist.wishlist;

        return response(res, 200, {
            success: true,
            message: 'Wishlist Products fetch successfully',
            data: {
                wishlistItems,
                totalItems,
                pageSize,
                currentPage: page,
            }
        });
    } catch (error) {
        next(createError(500, error, "Internal server error while fetching wishlist items"))
    }
};

export default getWishlistProductsController;

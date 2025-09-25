import userModel from "../../models/userModel.js";
import { response } from "../../utils/response.js";

// Update Wishlist items Controller:
const updateWishlistController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, type } = req.body;

        let update;
        if (type === "add") {
            update = await userModel.findByIdAndUpdate(userId, {
                $push: { wishlist: productId },
            });
        } else if (type === "remove") {
            update = await userModel.findByIdAndUpdate(
                userId,
                { $pull: { wishlist: productId } },
                { new: true }
            );
        }
        // console.log(type, response);
        const wishlistItems = update.wishlist;
        return response(res, 201, {
            success: true,
            data: wishlistItems,
            message: "Wishlist updated successfully"
        });
    } catch (error) {
        next(createError(500, error, "Error in Updating Wishlist Products"))
    }
};
export default updateWishlistController;

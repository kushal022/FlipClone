
import { createError } from "../../middleware/errorHandler.js"
import { response } from "../../utils/response.js";
import CartModel from "../../models/cartModel.js";


// get Cart controller:
export const getCartController = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // find cart for the user: 
        let cart = await CartModel.findOne({ user: userId});
        if(!cart) {
            return response(res, 404, {
                success: false,
                message: "Cart not found",
                errorType: 'notFound'
            });
        }

            return response(res, 200, {
                success: true, 
                message: 'Cart fetched successfully',
                data: cart
            });
    } catch (error) {
        next(createError(500, "Error in fetch cart!"))
    }
}
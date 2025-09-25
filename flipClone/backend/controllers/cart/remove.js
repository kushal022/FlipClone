
import { createError } from "../../middleware/errorHandler.js"
import { response } from "../../utils/response.js";
import CartModel from "../../models/cartModel.js";
import mongoose  from "mongoose";


// Remove item from cart controller:
export const removeFromCartController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        // validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return response(res, 400, {
                success: false, 
                message: "Invalid Product Id", 
                errorType: "invalidProductId"
            });
        };

        // find cart for the user: 
        let cart = await CartModel.findOne({ user: userId});
        if(!cart) {
            return response(res, 404, {
                success: false,
                message: "Cart not found",
                errorType: 'notFound'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        // item exists in cart, remove it
        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            // console.log(item)
            const itemTotalPrice = item.price * item.quantity;
            cart.items.splice(itemIndex, 1);
            cart.totalPrice -= itemTotalPrice;
            cart.totalItems -= item.quantity;

            await cart.save();
            console.log('cart: ', cart)
            return response(res, 200, {
                success: true, 
                message: 'Item removed from cart successfully',
                data: cart
            });
        }else {
            // if item not in the cart's items
            return response(res, 404, {
                success: false,
                message: "Item not found",
                errorType: "notFound"
            });
        }
    } catch (error) {
        next(createError(500, "Error in removing item from cart!"))
    }
}
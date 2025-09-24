import CartModel from "../../models/cartModel.js";
import { response } from "../../utils/response.js";
import productModel from "../../models/productModel.js";
import mongoose from "mongoose";
import { createError } from "../../middleware/errorHandler.js";

// Add to cart controller:
export const addToCartController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, name, price, quantity, image, saveForLater} = req.body;

        // validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return response(res, 400, {
                success: false,
                message: "Invalid Product Id",
                errorType: "invalidProductId"
            })
        }

        // check if product exists:
        const product = await productModel.findById(productId);
        if (!product) {
            return response(res, 404, {
                success: false, 
                message: "Product not found",
                errorType: "notFound"
            })
        }

        // find cart for the user:
        let cart = await CartModel.findOne({ user: userId});
        if (!cart) {
            // create cart if not exists
            const newCart = new CartModel({
                user: userId,
                items: [{ productId, name, price, quantity, image, saveForLater}],
                totalPrice: price * quantity,
                totalItems: quantity,
            });
            await newCart.save();
            return response(res, 201, {
                success: true,
                message: "New Cart Created and Item Added to Cart",
                data: newCart
            });
        }else {
            // if cart exists, update it
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            let newTotalPrice = cart.totalPrice + price * quantity;
            let newTotalItems = cart.totalItems + quantity;
            if (itemIndex > -1 ) {
                // item exists in cart, update its quantity
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].saveForLater = saveForLater;
                cart.totalPrice = newTotalPrice;
                cart.totalItems = newTotalItems;

                await cart.save();
                return response(res, 200, {
                    success: true, 
                    message: "Cart updated successfully"
                });
            }else {
                // item does not exist in cart, add new item
                cart.items.push({ productId, name, price, quantity, image, saveForLater});
                cart.totalPrice = newTotalPrice;
                cart.totalItems = newTotalItems;

                await cart.save();
                await cart.populate("items.productId");

                return response(res, 200, {
                    success: true, 
                    message: "Item added to cart successfully",
                    data: cart
                });
            }
        }
    } catch (error) {
        next(createError(500, "Error in Adding to Car!"))
    }
}
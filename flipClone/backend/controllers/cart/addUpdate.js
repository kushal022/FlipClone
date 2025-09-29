import CartModel from "../../models/cartModel.js";
import { response } from "../../utils/response.js";
import productModel from "../../models/productModel.js";
import mongoose from "mongoose";
import { createError } from "../../middleware/errorHandler.js";

// Add to cart controller:
export const addToCartController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, name, price, quantity, stock, brandName, discountPrice, seller, image, saveForLater} = req.body;

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
                items: [{ productId, name, price, stock, brandName, seller, discountPrice, quantity, image, saveForLater}],
                totalPrice: price * 1,
                totalDiscountPrice: discountPrice * 1,
                totalItems: 1,
            });
            let cart = await newCart.save();
            await cart.populate("items.productId");
            return response(res, 201, {
                success: true,
                message: "New Cart Created and Item Added to Cart",
                data: newCart
            });
        }else {
            // if cart exists, update it
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            let newTotalPrice = cart.totalPrice + price * 1;
            let newTotalDiscountPrice = cart.totalDiscountPrice + discountPrice * 1;
            let newTotalItems = cart.totalItems + 1;

            // If item exists in cart, update its quantity
            if (itemIndex > -1 ) {
                cart.items[itemIndex].quantity += 1;
                cart.items[itemIndex].saveForLater = saveForLater;
                cart.totalPrice = newTotalPrice;
                cart.totalDiscountPrice = newTotalDiscountPrice;
                cart.totalItems = newTotalItems;

                await cart.save();
                await cart.populate("items.productId");
                return response(res, 200, {
                    success: true, 
                    message: "Cart updated successfully",
                    data: cart
                });
            }else {
                //If item does not exist in cart, add new item
                cart.items.push({ productId, name, price,stock, brandName, seller, discountPrice, quantity, image, saveForLater});
                cart.totalPrice = newTotalPrice;
                cart.totalDiscountPrice = newTotalDiscountPrice;
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


export const decQuantityController = async(req, res, next) => {
    try {
         const userId = req.user._id;
         const { productId } = req.body;
         console.log(productId)

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

        // find cart:
        const cart = await CartModel.findOne({user: userId});
        if (!cart) return response(res, 404, {
            success: false,
            message: "Cart not found",
            errorType: "notFound"
        })

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            let item = cart.items[itemIndex];

            let newTotalPrice = cart.totalPrice - item.price;
            let newTotalItems = cart.totalItems - 1;

            if (itemIndex > -1 ) {
                // item exists in cart, update its quantity
                if (item.quantity > 0 ){
                    item.quantity -= 1 
                    cart.totalPrice = newTotalPrice;
                    cart.totalItems = newTotalItems;
                }else{
                    return 
                }
                await cart.save();
                return response(res, 200, {
                    success: true, 
                    message: "Cart item dec quantity successfully",
                    data: cart
                });
            }   
    } catch (error) {
        next(createError(500, "Error in decrease cart item!"))
    }
}
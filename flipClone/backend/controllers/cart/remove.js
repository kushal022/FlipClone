
import { createError } from "../../middleware/errorHandler.js"
import { response } from "../../utils/response.js";
import CartModel from "../../models/cartModel.js";
import mongoose  from "mongoose";
import { calculateCartTotals } from "../../utils/cart.utils.js";


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

        // if card exist find item init:
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        // item exists in cart, remove it
        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            // console.log(item)
            const itemTotalPrice = item.price * item.quantity;
            const itemTotalDiscountPrice = item.discountPrice * item.quantity;
            cart.items.splice(itemIndex, 1);
            cart.totalPrice -= itemTotalPrice;
            cart.totalDiscountPrice -= itemTotalDiscountPrice;
            cart.totalItems -= item.quantity;

            await cart.save();
            // console.log('cart: ', cart)
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


//-----------------------------

export const removeFromCartController2 = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      await session.abortTransaction();
      return response(res, 400, {
        success: false,
        message: "Product ID is required",
        errorType: "validationError"
      });
    }

    // Find cart
    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      await session.abortTransaction();
      return response(res, 404, {
        success: false,
        message: "Cart not found",
        errorType: "notFound"
      });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      await session.abortTransaction();
      return response(res, 404, {
        success: false,
        message: "Item not found in cart",
        errorType: "notFound"
      });
    }

    // Remove item
    const removedItem = cart.items.splice(itemIndex, 1)[0];

    // Recalculate totals
    const totals = calculateCartTotals(cart.items);
    cart.totalPrice = totals.totalPrice;
    cart.totalDiscountPrice = totals.totalDiscountPrice;
    cart.totalItems = totals.totalItems;

    await cart.save({ session });
    await session.commitTransaction();

    const populatedCart = await CartModel.findById(cart._id)
      .populate('items.productId', 'name images price discountPrice stock')
      .lean();

    return response(res, 200, {
      success: true,
      message: 'Item removed from cart successfully',
      data: populatedCart,
      removedItem: {
        productId: removedItem.productId,
        name: removedItem.name,
        quantity: removedItem.quantity
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(createError(500,error, error.message || "Error in removing item from cart!"));
  } finally {
    session.endSession();
  }
};
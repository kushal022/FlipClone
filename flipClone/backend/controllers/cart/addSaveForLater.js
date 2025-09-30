import Cart from "../../models/cartModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";

// SAVE ITEM FOR LATER
export const saveForLaterController = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return response(res, 404, { success: false, message: "Cart not found" });
    }

    // Find item in cart.items
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return response(res, 404, { success: false, message: "Item not found in cart" });
    }

    // Move item → savedItems
    const [item] = cart.items.splice(itemIndex, 1);
    cart.savedItems.push(item);

    // Update totals
    cart.totalItems = cart.items.length;
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity, // review for later
      0
    );
    cart.totalDiscountPrice = cart.items.reduce(
      (sum, item) => sum + item.discountPrice * item.quantity, 0
    );

    await cart.save();

    return response(res, 200, {
      success: true,
      message: "Item saved for later",
      data: cart,
    });
  } catch (error) {
    next(createError(500, error, "Error saving for later"));
  }
};

// MOVE ITEM BACK TO CART
export const moveToCartController = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return response(res, 404, { success: false, message: "Cart not found" });
    }

    // Find item in savedItems
    const itemIndex = cart.savedItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return response(res, 404, { success: false, message: "Item not found in saved items" });
    }

    // Move item → cart.items
    const [item] = cart.savedItems.splice(itemIndex, 1);
    cart.items.push(item);

    // Update totals
    cart.totalItems = cart.items.length;
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cart.totalDiscountPrice = cart.items.reduce(
      (sum, item) => sum + item.discountPrice * item.quantity,
      0
    );

    await cart.save();

    return response(res, 200, {
      success: true,
      message: "Item moved back to cart",
      data: cart,
    });
  } catch (error) {
    next(createError(500, error, "Error moving item to cart"));
  }
}; 

// REMOVE FROM SAVE FOR LATER
export const removeSavedItemController = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return response(res, 404, { success: false, message: "Cart not found" });
    }

    // Remove item from savedItems
    cart.savedItems = cart.savedItems.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    return response(res, 200, {
      success: true,
      message: "Item removed from saved list",
      data: cart,
    });
  } catch (error) {
    next(createError(500, error, "Error removing saved item"));
  }
};

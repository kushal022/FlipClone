import Order from "../../models/orderModel.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";
import { response } from "../../utils/response.js";
// import { calculateCartTotals } from "../../utils/cart.utils.js";
import mongoose from "mongoose";

const calculateCartTotals = (items) => {
  return items.reduce(
    (totals, item) => {
      totals.totalPrice += item.price * item.quantity;
      totals.totalDiscountPrice += item.discountPrice * item.quantity;
      totals.totalItems += item.quantity;
      return totals;
    },
    { totalPrice: 0, totalDiscountPrice: 0, totalItems: 0 }
  );
};

// UPDATE CART AND PRODUCT SOCK WHEN ORDER CONFIRMED:
export const updateCartAndProductCtrl = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;

    if (!orderId) {
      return response(res, 400, {
        success: false,
        message: "Order ID is required",
        errorType: "validationError",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return response(res, 404, {
        success: false,
        message: "Order not found",
        errorType: "notFound",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return response(res, 404, {
        success: false,
        message: "Cart not found",
        errorType: "notFound",
      });
    }

    // Remove ordered products from cart:
    const orderedProductIds = order.orderItems.map(item => item.productId.toString());

    cart.items = cart.items.filter(item =>
      !orderedProductIds.includes(item.productId.toString())
    );

    // Recalculate totals using utility
    const totals = calculateCartTotals(cart.items);
    cart.totalPrice = totals.totalPrice;
    cart.totalDiscountPrice = totals.totalDiscountPrice;
    cart.totalItems = totals.totalItems;

    // Update product stock
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update stock for each ordered product
      for (const item of order.orderItems) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        product.stock -= item.quantity;
        await product.save({ session });
      }

      // Save updated cart
      await cart.save({ session });

      await session.commitTransaction();

      // Fetch updated cart with populated product details
      const updatedCart = await Cart.findById(cart._id)
        .populate('items.productId', 'name images price discountPrice stock')
        .lean();

      return response(res, 200, {
        success: true,
        message: "Cart and product stock updated successfully",
        data: updatedCart,
      });
    } catch (error) {
      await session.abortTransaction();
      return response(res, 500, {
        success: false,
        message: error.message || "Error updating cart and stock",
        errorType: "serverError",
      });
    } finally {
      session.endSession();
    }
  } catch (error) {
    return response(res, 500, {
      success: false,
      message: error.message || "Internal server error",
      errorType: "serverError",
    });
  }
};

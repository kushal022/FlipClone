import Order from "../../models/orderModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";

// ------------------- PLACE ORDER -------------------
export const createOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return response(res, 400, { success: false, message: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    return response(res, 201, {
      success: true,
      data: createdOrder,
      message: "Order placed successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error in create order"));
  }
};








import Order from "../../models/orderModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";



// ------------------- GET USER ORDERS -------------------
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return response(res, 200, {
      success: true,
      data: orders,
    });
  } catch (error) {
    next(createError(500, error, "Error in get user orders"));
  }
};
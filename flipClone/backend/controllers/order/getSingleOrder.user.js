import Order from "../../models/orderModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";

// ------------------- GET SINGLE ORDER -------------------
export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return response(res, 404, { success: false, message: "Order not found" });
    }

    return response(res, 200, { success: true, data: order });
  } catch (error) {
    next(createError(500, error, "Error in get single order"));
  }
};
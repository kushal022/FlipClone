import Order from "../../models/orderModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";


// ------------------- UPDATE ORDER STATUS -------------------
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return response(res, 404, { success: false, message: "Order not found" });
    }

    const { status } = req.body;
    order.orderStatus = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    return response(res, 200, {
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error in update order status"));
  }
};

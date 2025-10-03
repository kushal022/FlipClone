import Order from "../../models/orderModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";

// ------------------- GET USER ORDERS -------------------
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ buyer: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("buyer", "fname lname email") // Populate user details if needed
      // .populate("orderItems.productId", "name image"); // Populate product details

    const totalOrders = await Order.countDocuments({ buyer: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    return response(res, 200, {
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(createError(500, error, "Error in get user orders"));
  }
};

// import Order from "../../models/orderModel.js";
// import { createError } from "../../middleware/errorHandler.js";
// import { response } from "../../utils/response.js";

// // ------------------- GET USER ORDERS -------------------
// export const getUserOrders = async (req, res, next) => {
//   try {
//     // const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

//     return response(res, 200, {
//       success: true,
//       data: orders,
//     });
//   } catch (error) {
//     next(createError(500, error, "Error in get user orders"));
//   }
// };

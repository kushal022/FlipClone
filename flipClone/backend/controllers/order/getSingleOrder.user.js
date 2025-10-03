import Order from "../../models/orderModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";

// ------------------- GET SINGLE ORDER BY ID -------------------
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      cashfreeOrderId: orderId,
      buyer: userId
    })
    .populate('buyer', 'fname lname email phone')
    .populate('orderItems.productId', 'name images price');

    // console.log(order)

    if (!order) {
      return response(res, 404, {
        success: false,
        message: "Order not found",
        errorType: 'notFound'
      });
    }

    return response(res, 200, {
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return response(res, 400, {
        success: false,
        message: "Invalid order ID format",
        errorType: 'validation'
      });
    }
    next(createError(500, error, "Error in get order by ID"));
  }
};

// ------------------- GET ALL ORDERS (ADMIN) -------------------
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // Filter by status
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }
    
    // Filter by payment status
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    return response(res, 200, {
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
      }
    });
  } catch (error) {
    next(createError(500, error, "Error in get all orders"));
  }
};

// ------------------- GET ORDER STATISTICS (ADMIN) -------------------
export const getOrderStats = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query; // daily, weekly, monthly, yearly

    let groupFormat;
    switch (period) {
      case 'daily':
        groupFormat = { 
          year: { $year: "$createdAt" }, 
          month: { $month: "$createdAt" }, 
          day: { $dayOfMonth: "$createdAt" } 
        };
        break;
      case 'weekly':
        groupFormat = { 
          year: { $year: "$createdAt" }, 
          week: { $week: "$createdAt" } 
        };
        break;
      case 'yearly':
        groupFormat = { year: { $year: "$createdAt" } };
        break;
      default: // monthly
        groupFormat = { 
          year: { $year: "$createdAt" }, 
          month: { $month: "$createdAt" } 
        };
    }

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    // Status distribution
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment status distribution
    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    return response(res, 200, {
      success: true,
      data: {
        timeline: stats,
        statusDistribution: statusStats,
        paymentDistribution: paymentStats,
        period
      }
    });
  } catch (error) {
    next(createError(500, error, "Error in get order statistics"));
  }
};

// ------------------- GET SALES ANALYTICS (ADMIN) -------------------
export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "PAID" // Only count paid orders
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          date: { $first: "$createdAt" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "PAID"
        }
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    return response(res, 200, {
      success: true,
      data: {
        salesData,
        topProducts,
        period: `${days} days`
      }
    });
  } catch (error) {
    next(createError(500, error, "Error in get sales analytics"));
  }
};


// import Order from "../../models/orderModel.js";
// import { createError } from "../../middleware/errorHandler.js";
// import { response } from "../../utils/response.js";

// // ------------------- GET SINGLE ORDER -------------------
// export const getSingleOrder = async (req, res, next) => {
//   try {
//     const order = await Order.findById(req.params.id).populate("user", "name email");

//     if (!order) {
//       return response(res, 404, { success: false, message: "Order not found" });
//     }

//     return response(res, 200, { success: true, data: order });
//   } catch (error) {
//     next(createError(500, error, "Error in get single order"));
//   }
// };
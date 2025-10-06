import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";
import Order from "../../models/orderModel.js";
import User from "../../models/userModel.js";
// import Product from "../../models/productModel.js";

// ------------------- GET SELLER ORDERS -------------------
export const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    //? Build filter object - FIXED for your schema
    const filter = {
      "orderItems.seller": sellerId
    };

    // Add status filter
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    // Add payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Add search filter - FIXED for your schema fields
    if (search) {
      filter.$or = [
        { cashfreeOrderId: { $regex: search, $options: 'i' } },
        { "orderItems.name": { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Fetch orders with pagination and population - FIXED population
    const orders = await Order.find(filter)
      .populate('buyer', 'fname lname email phone')
      .populate('orderItems.productId', 'name images price discountPrice stock')
      .populate('orderItems.seller', 'fname lname email') // Populate seller info
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Transform orders to include only seller's items - FIXED for your schema
    const transformedOrders = orders.map(order => {
      // Filter order items to only include items from this seller
      const sellerItems = order.orderItems.filter(item => {
        // Handle both populated and unpopulated seller
        const itemSellerId = item.seller?._id ? item.seller._id.toString() : item.seller?.toString();
        return itemSellerId === sellerId.toString();
      });

      // Calculate seller-specific totals - FIXED for your schema fields
      const sellerTotals = sellerItems.reduce(
        (totals, item) => {
          totals.itemsCount += item.quantity;
          totals.totalAmount += (item.discountPrice || item.price) * item.quantity;
          totals.originalAmount += item.price * item.quantity;
          return totals;
        },
        { itemsCount: 0, totalAmount: 0, originalAmount: 0 }
      );

      return {
        _id: order._id,
        cashfreeOrderId: order.cashfreeOrderId,
        buyer: order.buyer,
        shippingAddress: order.shippingAddress,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        itemsPrice: order.itemsPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderItems: sellerItems, // Only show seller's items
        sellerStats: {
          ...sellerTotals,
          savings: sellerTotals.originalAmount - sellerTotals.totalAmount
        }
      };
    }).filter(order => order.orderItems.length > 0); // Remove orders with no items from this seller

    // Get order statistics for the seller - FIXED for your schema
    const orderStats = await getSellerOrderStats(sellerId, filter);

    return response(res, 200, {
      success: true,
      message: 'Seller orders fetched successfully!',
      data: {
        orders: transformedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
          limit: parseInt(limit)
        },
        stats: orderStats,
        filters: {
          status,
          paymentStatus,
          dateRange: { startDate, endDate },
          search
        }
      }
    });

  } catch (error) {
    console.error('Get seller orders error:', error);
    next(createError(500, error.message || "Error in getting seller orders"));
  }
};

// ------------------- GET SELLER ORDER STATISTICS -------------------
const getSellerOrderStats = async (sellerId, baseFilter = {}) => {
  try {
    const stats = await Order.aggregate([
      {
        $match: {
          ...baseFilter,
          "orderItems.seller": sellerId
        }
      },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.seller": { $eq: new mongoose.Types.ObjectId(sellerId) }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: "$_id" },
          totalRevenue: { 
            $sum: { 
              $multiply: [
                { $ifNull: ["$orderItems.discountPrice", "$orderItems.price"] }, 
                "$orderItems.quantity"
              ] 
            } 
          },
          totalItemsSold: { $sum: "$orderItems.quantity" },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Pending"] }, 1, 0]
            }
          },
          confirmedOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Confirmed"] }, 1, 0]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Processing"] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Shipped"] }, 1, 0]
            }
          },
          outForDeliveryOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Out For Delivery"] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0]
            }
          },
          returnedOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Returned"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          totalOrders: { $size: "$totalOrders" },
          totalRevenue: 1,
          totalItemsSold: 1,
          pendingOrders: 1,
          confirmedOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          outForDeliveryOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1,
          returnedOrders: 1
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalItemsSold: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      outForDeliveryOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      returnedOrders: 0
    };
  } catch (error) {
    console.error('Error getting seller stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalItemsSold: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      outForDeliveryOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      returnedOrders: 0
    };
  }
};

// ------------------- GET SELLER ORDER DETAILS -------------------
export const getSellerOrderDetails = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;

    if (!orderId) {
      return response(res, 400, {
        success: false,
        message: "Order ID is required",
        errorType: "validationError"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      "orderItems.seller": sellerId
    })
    .populate('buyer', 'fname lname email phone')
    .populate('orderItems.productId', 'name images price discountPrice stock category brandName')
    .populate('orderItems.seller', 'fname lname email phone')
    .lean();

    if (!order) {
      return response(res, 404, {
        success: false,
        message: "Order not found or you don't have permission to view this order",
        errorType: "notFound"
      });
    }

    // Filter to show only seller's items
    const sellerItems = order.orderItems.filter(item => {
      const itemSellerId = item.seller?._id ? item.seller._id.toString() : item.seller?.toString();
      return itemSellerId === sellerId.toString();
    });

    // Calculate seller-specific totals
    const sellerTotals = sellerItems.reduce(
      (totals, item) => {
        totals.itemsCount += item.quantity;
        totals.totalAmount += (item.discountPrice || item.price) * item.quantity;
        totals.originalAmount += item.price * item.quantity;
        return totals;
      },
      { itemsCount: 0, totalAmount: 0, originalAmount: 0 }
    );

    const orderWithSellerData = {
      _id: order._id,
      cashfreeOrderId: order.cashfreeOrderId,
      buyer: order.buyer,
      shippingAddress: order.shippingAddress,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      itemsPrice: order.itemsPrice,
      shippingPrice: order.shippingPrice,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: sellerItems,
      sellerStats: {
        ...sellerTotals,
        savings: sellerTotals.originalAmount - sellerTotals.totalAmount
      }
    };

    return response(res, 200, {
      success: true,
      message: 'Seller order details fetched successfully!',
      data: orderWithSellerData
    });

  } catch (error) {
    console.error('Get seller order details error:', error);
    next(createError(500, error.message || "Error in getting seller order details"));
  }
};

// ------------------- UPDATE SELLER ORDER STATUS -------------------
export const updateSellerOrderStatus = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;
    const { status, trackingNumber, shippingCarrier } = req.body;

    if (!orderId || !status) {
      return response(res, 400, {
        success: false,
        message: "Order ID and status are required",
        errorType: "validationError"
      });
    }

    // Validate status against your schema enum
    const validStatuses = ["Pending", "Processing", "Confirmed", "Shipped", "Out For Delivery", "Delivered", "Cancelled", "Returned"];
    if (!validStatuses.includes(status)) {
      return response(res, 400, {
        success: false,
        message: "Invalid order status",
        errorType: "validationError"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      "orderItems.seller": sellerId
    });

    if (!order) {
      return response(res, 404, {
        success: false,
        message: "Order not found or you don't have permission to update this order",
        errorType: "notFound"
      });
    }

    // Update order status
    order.orderStatus = status;
    
    // Update delivery status based on order status
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    // Add tracking info if provided
    if (status === 'Shipped' && trackingNumber) {
      order.trackingInfo = {
        trackingNumber,
        shippingCarrier: shippingCarrier || 'Standard',
        shippedAt: new Date()
      };
    }

    await order.save();

    // Populate the updated order
    const updatedOrder = await Order.findById(orderId)
      .populate('buyer', 'fname lname email phone')
      .populate('orderItems.productId', 'name images')
      .populate('orderItems.seller', 'fname lname');

    return response(res, 200, {
      success: true,
      message: `Order status updated to ${status} successfully!`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update seller order status error:', error);
    next(createError(500, error.message || "Error in updating order status"));
  }
};

// ------------------- GET SELLER DASHBOARD STATS -------------------
export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.user._id;

    // Get basic stats
    const basicStats = await getSellerOrderStats(sellerId);

    // Get recent orders
    const recentOrders = await Order.find({
      "orderItems.seller": sellerId
    })
    .populate('buyer', 'fname lname')
    .populate('orderItems.productId', 'name images')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Transform recent orders
    const transformedRecentOrders = recentOrders.map(order => {
      const sellerItems = order.orderItems.filter(item => {
        const itemSellerId = item.seller?._id ? item.seller._id.toString() : item.seller?.toString();
        return itemSellerId === sellerId.toString();
      });

      return {
        _id: order._id,
        cashfreeOrderId: order.cashfreeOrderId,
        buyer: order.buyer,
        orderStatus: order.orderStatus,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        itemCount: sellerItems.length
      };
    });

    return response(res, 200, {
      success: true,
      message: 'Seller dashboard stats fetched successfully!',
      data: {
        stats: basicStats,
        recentOrders: transformedRecentOrders
      }
    });

  } catch (error) {
    console.error('Get seller dashboard stats error:', error);
    next(createError(500, error.message || "Error in getting seller dashboard stats"));
  }
};
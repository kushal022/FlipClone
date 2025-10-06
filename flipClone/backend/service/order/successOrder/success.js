// import Order from "../../models/orderModel.js";
// import Cart from "../../models/cartModel.js";
// import Product from "../../models/productModel.js";
// import User from "../../models/userModel.js";
// import { response } from "../../utils/response.js";
// import { createError } from "../../middleware/errorHandler.js";
// import mongoose from "mongoose";

// // ------------------- ORDER CONFIRMATION CONTROLLER -------------------
// export const confirmOrderController = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { orderId } = req.params;
//     const userId = req.user._id;

//     // Validate order ID
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       await session.abortTransaction();
//       return response(res, 400, {
//         success: false,
//         message: "Invalid Order ID",
//         errorType: "validationError"
//       });
//     }

//     // Find and validate order
//     const order = await Order.findOne({
//       _id: orderId,
//       user: userId
//     }).session(session);

//     if (!order) {
//       await session.abortTransaction();
//       return response(res, 404, {
//         success: false,
//         message: "Order not found",
//         errorType: "notFound"
//       });
//     }

//     // Check if order is already confirmed
//     if (order.orderStatus === "Confirmed" || order.isPaid) {
//       await session.abortTransaction();
//       return response(res, 400, {
//         success: false,
//         message: "Order is already confirmed",
//         errorType: "alreadyProcessed"
//       });
//     }

//     // Check if payment is successful
//     if (order.paymentStatus !== "PAID") {
//       await session.abortTransaction();
//       return response(res, 400, {
//         success: false,
//         message: "Payment not completed",
//         errorType: "paymentPending"
//       });
//     }

//     // Process order confirmation
//     await processOrderConfirmation(order, userId, session);

//     // Commit transaction
//     await session.commitTransaction();

//     // Fetch updated order with populated data
//     const updatedOrder = await Order.findById(orderId)
//       .populate('user', 'fname lname email phone')
//       .populate('orderItems.productId', 'name images category brandName')
//       .lean();

//     return response(res, 200, {
//       success: true,
//       message: "Order confirmed successfully! Items removed from cart and stock updated.",
//       data: updatedOrder
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     next(createError(500, error.message || "Error in confirming order"));
//   } finally {
//     session.endSession();
//   }
// };

// // ------------------- PROCESS ORDER CONFIRMATION -------------------
// const processOrderConfirmation = async (order, userId, session) => {
//   try {
//     // 1. Update order status
//     order.orderStatus = "Confirmed";
//     order.isPaid = true;
//     order.paidAt = new Date();
//     order.confirmedAt = new Date();
    
//     // Add order confirmation timeline
//     if (!order.orderTimeline) {
//       order.orderTimeline = [];
//     }
//     order.orderTimeline.push({
//       status: "Confirmed",
//       timestamp: new Date(),
//       description: "Order confirmed and processing started"
//     });

//     await order.save({ session });

//     // 2. Remove ordered items from user's cart
//     await removeItemsFromCart(order.orderItems, userId, session);

//     // 3. Update product stock and sales data
//     await updateProductStockAndSales(order.orderItems, session);

//     // 4. Update user's order history and statistics
//     await updateUserOrderStats(userId, order.totalPrice, session);

//     // 5. Send confirmation notification (you can integrate with email service)
//     await sendOrderConfirmationNotification(order);

//   } catch (error) {
//     throw new Error(`Order confirmation processing failed: ${error.message}`);
//   }
// };

// // ------------------- REMOVE ITEMS FROM CART -------------------
// const removeItemsFromCart = async (orderItems, userId, session) => {
//   try {
//     const cart = await Cart.findOne({ user: userId }).session(session);
    
//     if (!cart || cart.items.length === 0) {
//       return; // No cart or empty cart
//     }

//     // Remove ordered products from cart
//     const orderedProductIds = orderItems.map(item => item.productId.toString());
    
//     cart.items = cart.items.filter(item => 
//       !orderedProductIds.includes(item.productId.toString())
//     );

//     // Recalculate cart totals
//     const totals = calculateCartTotals(cart.items);
//     cart.totalPrice = totals.totalPrice;
//     cart.totalDiscountPrice = totals.totalDiscountPrice;
//     cart.totalItems = totals.totalItems;

//     await cart.save({ session });

//     console.log(`Removed ${orderedProductIds.length} items from cart for user ${userId}`);
    
//   } catch (error) {
//     throw new Error(`Failed to remove items from cart: ${error.message}`);
//   }
// };

// // ------------------- UPDATE PRODUCT STOCK AND SALES -------------------
// const updateProductStockAndSales = async (orderItems, session) => {
//   try {
//     const bulkOperations = [];
//     const productUpdates = [];

//     for (const item of orderItems) {
//       const productId = item.productId;
//       const quantity = item.quantity;

//       // Create bulk write operation for stock update
//       bulkOperations.push({
//         updateOne: {
//           filter: { _id: productId },
//           update: {
//             $inc: {
//               stock: -quantity,
//               sold: quantity,
//               totalRevenue: item.discountPrice * quantity
//             },
//             $set: {
//               lastSoldAt: new Date()
//             },
//             $addToSet: {
//               recentBuyers: {
//                 userId: session.userId, // You might want to pass this
//                 purchasedAt: new Date(),
//                 quantity: quantity
//               }
//             }
//           }
//         }
//       });

//       productUpdates.push({
//         productId,
//         quantity,
//         updateData: {
//           stockDecrement: quantity,
//           soldIncrement: quantity,
//           revenue: item.discountPrice * quantity
//         }
//       });
//     }

//     // Execute bulk operations
//     if (bulkOperations.length > 0) {
//       await Product.bulkWrite(bulkOperations, { session });
//     }

//     // Update category and brand sales statistics
//     await updateCategoryAndBrandStats(orderItems, session);

//     console.log(`Updated stock for ${productUpdates.length} products`);
    
//   } catch (error) {
//     throw new Error(`Failed to update product stock: ${error.message}`);
//   }
// };

// // ------------------- UPDATE CATEGORY AND BRAND STATS -------------------
// const updateCategoryAndBrandStats = async (orderItems, session) => {
//   try {
//     // Get product details to update category and brand stats
//     const productIds = orderItems.map(item => item.productId);
//     const products = await Product.find({ _id: { $in: productIds } })
//       .select('category brandName')
//       .session(session);

//     // You can implement category and brand sales tracking here
//     // This would require additional models for CategoryStats and BrandStats
    
//     console.log(`Processed category/brand stats for ${products.length} products`);
    
//   } catch (error) {
//     console.warn(`Category/brand stats update failed: ${error.message}`);
//     // Don't throw error here as it's non-critical
//   }
// };

// // ------------------- UPDATE USER ORDER STATS -------------------
// const updateUserOrderStats = async (userId, orderAmount, session) => {
//   try {
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $inc: {
//           totalOrders: 1,
//           totalSpent: orderAmount,
//           loyaltyPoints: Math.floor(orderAmount / 100) // 1 point per 100 rupees
//         },
//         $set: {
//           lastOrderDate: new Date()
//         }
//       },
//       { session }
//     );

//     console.log(`Updated order stats for user ${userId}`);
    
//   } catch (error) {
//     console.warn(`User stats update failed: ${error.message}`);
//     // Don't throw error here as it's non-critical
//   }
// };

// // ------------------- SEND ORDER CONFIRMATION NOTIFICATION -------------------
// const sendOrderConfirmationNotification = async (order) => {
//   try {
//     // Integrate with your email service (Nodemailer, SendGrid, etc.)
//     // This is a placeholder for email notification logic
    
//     const notificationData = {
//       orderId: order._id,
//       customerEmail: order.buyer?.email,
//       customerName: `${order.buyer?.fname} ${order.buyer?.lname}`,
//       orderAmount: order.totalPrice,
//       orderDate: order.createdAt,
//       items: order.orderItems.map(item => ({
//         name: item.name,
//         quantity: item.quantity,
//         price: item.discountPrice
//       }))
//     };

//     // Example: Send email notification
//     // await emailService.sendOrderConfirmation(notificationData);
    
//     console.log(`Order confirmation notification prepared for order ${order._id}`);
    
//   } catch (error) {
//     console.warn(`Notification sending failed: ${error.message}`);
//     // Don't throw error here as it's non-critical
//   }
// };

// // ------------------- UTILITY FUNCTIONS -------------------
// const calculateCartTotals = (items) => {
//   return items.reduce(
//     (totals, item) => {
//       totals.totalPrice += item.price * item.quantity;
//       totals.totalDiscountPrice += item.discountPrice * item.quantity;
//       totals.totalItems += item.quantity;
//       return totals;
//     },
//     { totalPrice: 0, totalDiscountPrice: 0, totalItems: 0 }
//   );
// };

// // ------------------- BULK ORDER CONFIRMATION (ADMIN) -------------------
// export const bulkConfirmOrdersController = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { orderIds } = req.body;

//     if (!Array.isArray(orderIds) || orderIds.length === 0) {
//       await session.abortTransaction();
//       return response(res, 400, {
//         success: false,
//         message: "Order IDs array is required",
//         errorType: "validationError"
//       });
//     }

//     // Validate all order IDs
//     const validOrderIds = orderIds.filter(id => mongoose.Types.ObjectId.isValid(id));
//     if (validOrderIds.length !== orderIds.length) {
//       await session.abortTransaction();
//       return response(res, 400, {
//         success: false,
//         message: "Some order IDs are invalid",
//         errorType: "validationError"
//       });
//     }

//     // Find all valid orders
//     const orders = await Order.find({
//       _id: { $in: validOrderIds },
//       orderStatus: { $ne: "Confirmed" },
//       paymentStatus: "PAID"
//     }).session(session);

//     if (orders.length === 0) {
//       await session.abortTransaction();
//       return response(res, 404, {
//         success: false,
//         message: "No confirmable orders found",
//         errorType: "notFound"
//       });
//     }

//     // Process each order
//     const results = {
//       successful: [],
//       failed: []
//     };

//     for (const order of orders) {
//       try {
//         await processOrderConfirmation(order, order.user, session);
//         results.successful.push(order._id);
//       } catch (error) {
//         results.failed.push({
//           orderId: order._id,
//           error: error.message
//         });
//       }
//     }

//     await session.commitTransaction();

//     return response(res, 200, {
//       success: true,
//       message: `Processed ${results.successful.length} orders successfully, ${results.failed.length} failed`,
//       data: results
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     next(createError(500, error.message || "Error in bulk order confirmation"));
//   } finally {
//     session.endSession();
//   }
// };

// // ------------------- ORDER STATUS WEBHOOK -------------------
// export const orderStatusWebhookController = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { order_id, payment_status, order_status } = req.body;

//     if (!order_id) {
//       await session.abortTransaction();
//       return response(res, 400, {
//         success: false,
//         message: "Order ID is required in webhook",
//         errorType: "validationError"
//       });
//     }

//     // Find order by cashfree order ID
//     const order = await Order.findOne({
//       cashfreeOrderId: order_id
//     }).session(session);

//     if (!order) {
//       await session.abortTransaction();
//       return response(res, 404, {
//         success: false,
//         message: "Order not found for webhook",
//         errorType: "notFound"
//       });
//     }

//     // Update order status based on webhook data
//     if (payment_status === "SUCCESS" && order.orderStatus !== "Confirmed") {
//       await processOrderConfirmation(order, order.user, session);
//     } else {
//       // Update other statuses
//       order.paymentStatus = payment_status;
//       order.orderStatus = order_status;
//       await order.save({ session });
//     }

//     await session.commitTransaction();

//     return response(res, 200, {
//       success: true,
//       message: "Webhook processed successfully"
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("Webhook processing error:", error);
//     // Still return 200 to payment gateway to avoid retries
//     return response(res, 200, {
//       success: false,
//       message: "Webhook processed with errors"
//     });
//   } finally {
//     session.endSession();
//   }
// };
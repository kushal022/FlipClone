import { createError } from "../../middleware/errorHandler.js"
import { Cashfree } from "cashfree-pg";
import Order from "../../models/orderModel.js";
import { response } from "../../utils/response.js";

const statusMapping = {
  'SUCCESS': { paymentStatus: 'PAID', orderStatus: 'Confirmed' },
  'PENDING': { paymentStatus: 'PENDING', orderStatus: 'Processing' },
  'FAILED': { paymentStatus: 'FAILED', orderStatus: 'Cancelled' },
  'USER_DROPPED': { paymentStatus: 'CANCELLED', orderStatus: 'Cancelled' },
  'CANCELLED': { paymentStatus: 'CANCELLED', orderStatus: 'Cancelled' }
};

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_ENV = process.env.CASHFREE_ENV;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

const env = CASHFREE_ENV === "production" ? Cashfree.PRODUCTION : Cashfree.SANDBOX;
const cashfree = new Cashfree(env, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);

//* Verify Payment Status:
export const verifyCashfreeOrder = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    // Validate order_id
    if (!order_id) {
      return response(res, 400, {
        success: false,
        message: 'Order ID is required',
        errorType: 'validation'
      });
    }

    //? Call Cashfree API to get order payment status:
    const result = await cashfree.PGOrderFetchPayments(order_id);
    // console.log('-----------------', result.data[0].payment_status)
    
    if (!result || !result.data) {
      return response(res, 404, {
        success: false,
        message: 'Payment information not found',
        errorType: 'notFound'
      });
    }

    const status = result.data[0].payment_status;
    const paymentMethod = result.data[0].payment_method;
    const paymentTime = result.data[0].payment_time;

    // FIND ORDER IN DB
    const order = await Order.findOne({ cashfreeOrderId: order_id });
    if (!order) {
      return response(res, 404, {
        success: false,
        message: "Order not found in database",
        errorType: 'notFound'
      });
    }

    // Update Order based on payment status
    let updateData = {
      paymentInfo: result.data,
      paymentMethod: paymentMethod
    };
// console.log('================', status)
// console.log('================', paymentMethod)
    switch (status) {
      case "SUCCESS":
        updateData.paymentStatus = "PAID";
        updateData.isPaid = true;
        updateData.paidAt = paymentTime;
        updateData.orderStatus = 'Confirmed';
        
        await Order.findByIdAndUpdate(order._id, updateData);
        
        return response(res, 200, {
          success: true,
          message: "Payment successfully completed and order confirmed!",
          data: { ...order.toObject(), ...updateData }
        });

      case "PENDING":
        updateData.paymentStatus = "PENDING";
        updateData.orderStatus = 'Processing';
        
        await Order.findByIdAndUpdate(order._id, updateData);
        
        return response(res, 200, { // Changed to 200 since this is a valid state
          success: true,
          message: "Payment is processing",
          data: { ...order.toObject(), ...updateData }
        });

      case "FAILED":
      default:
        updateData.paymentStatus = "FAILED";
        updateData.orderStatus = 'Cancelled';
        
        await Order.findByIdAndUpdate(order._id, updateData);
        
        return response(res, 400, {
          success: false,
          message: "Payment failed",
          data: { ...order.toObject(), ...updateData }
        });
    }

  } catch (error) {
    console.error('Cashfree verification error:', error);
    
    // Handle specific Cashfree API errors
    if (error.response && error.response.status === 404) {
      return response(res, 404, {
        success: false,
        message: "Order not found in Cashfree system",
        errorType: 'notFound'
      });
    }
    
    return next(createError(500, error.message, "Error in verifying payment status"));
  }
};
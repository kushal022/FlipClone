import { Cashfree } from "cashfree-pg";
import crypto from "crypto";
import { createError } from "../../middleware/errorHandler.js";
import Order from "../../models/orderModel.js";


//* PAYMENT CONTROLLER: 

const  CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const  CASHFREE_ENV = process.env.CASHFREE_ENV;
const  CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const  FRONTEND_URL = process.env.FRONTEND_URL;

// init Cashfree (v5+ usage)
const env = CASHFREE_ENV === "production" ? Cashfree.PRODUCTION : Cashfree.SANDBOX;
const cashfree = new Cashfree(env, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);

// Helper to create unique order id in your system
const genOrderId = () => `order_${Date.now()}_${Math.floor(Math.random()*1000)}`;

//*Controller: Create Cashfree order and save local Order
export const createCashfreeOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      orderItems,            
      orderAmount,           
      shippingCharge,
      shippingAddress,
      customerName,
      customerEmail,
      customerAlternativeEmail,
      customerPhone,
    } = req.body;
//  console.log(orderItems)
    if (!orderItems || !orderAmount) {
      return res.status(400).json({ success: false, message: "Missing order data" });
    }

    // 1) create a local Order in DB (status PENDING)
    const localOrder = new Order({
      buyer: user?._id, 
      orderItems,
      shippingAddress,
      itemsPrice: orderAmount,
      shippingPrice:shippingCharge,
      totalPrice: orderAmount + shippingCharge,
      orderStatus: "Pending",
      cashfreeOrderId: null,
      paymentStatus: "PENDING",
    });
    await localOrder.save();

    // 2) prepare Cashfree create order payload
    const orderId = genOrderId(); 
    const payload = {
      order_id: orderId,
      order_amount: orderAmount + shippingCharge,
      order_currency: "INR",
      customer_details: {
        customer_id: (req.user?._id || localOrder._id).toString(),
        customer_name: customerName,
        customer_phone: customerPhone || "",
        customer_email: customerEmail || "",
      },
      order_meta: {
        return_url: `${FRONTEND_URL}/user/payment/success?order_id=${orderId}`,
        notify_url: `https://glory-hear-howard-fee.trycloudflare.com/api/v1/order/cashfree/webhook`
        // notify_url: `http://localhost:8080/api/v1/order/cashfree/webhook`
        // payment_methods: "cc,dc,upi"
      },
    };

    // 3) call Cashfree PGCreateOrder
    const response = await cashfree.PGCreateOrder(payload); // SDK promise

    // response.data has payment link or order info
    const cfData = response.data;
    // console.log('cfData: ----',response)

    // 4) update local order with cashfreeOrderId and payment link
    localOrder.cashfreeOrderId = orderId;
    localOrder.paymentInfo = { created: cfData };
    await localOrder.save();

    // 5) return payment link to client (or redirect URL)
    return res.status(200).json({
      success: true,
      paymentLink: cfData.payment_link, // hosted checkout link
      cashfreeData: cfData,
      orderId: orderId,
      localOrderId: localOrder._id
    });
  } catch (error) {
    return next(createError(500, error, "Error in create payment" ));
  }
};

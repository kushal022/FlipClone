import { Cashfree } from "cashfree-pg";
import Order from "../../models/orderModel.js";

//*  WEB HOOK CONTROLLER:
const  CASHFREE_ENV = process.env.CASHFREE_ENV;
const  CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const  CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
// init as before
const env = CASHFREE_ENV === "production" ? Cashfree.PRODUCTION : Cashfree.SANDBOX;
const cashfree = new Cashfree(env, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);

//CONTROLLER:
export const cashfreeWebhook = async (req, res, next) => {
  try {
    // Cashfree sends signature header (check exact header name in your dashboard/docs)
    const signature = req.headers["x-webhook-signature"] || req.headers["x-signature"];
    const timestamp = req.headers["x-webhook-timestamp"] || req.headers["x-timestamp"];

    // raw body is required for verification
    const rawBody = req.rawBody; // Buffer

    // SDK helper (README shows PGVerifyWebhookSignature usage)
    // If SDK has a verify function:
    try {
      cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch (err) {
      console.error("Webhook signature invalid", err.message);
      return res.status(400).send("Invalid signature");
    }

    // parse JSON payload (we stored rawBody but req.body is already parsed)
    const payload = req.body;
    // payload will contain order_id, order_status/payment_status etc
    const { order_id, order_status, order_amount, order_currency, payment_id } = payload;

    // # find local order by cashfree order id or mapping
    const localOrder = await Order.findOne({ cashfreeOrderId: order_id });
    if (!localOrder) {
      console.warn("Order not found for webhook", order_id);
      return res.status(404).send("Order not found");
    }

    // Example: if Cashfree sends order_status = 'PAID'
    if (order_status === "PAID" || payload.tx_status === "SUCCESS") {
      localOrder.paymentStatus = "PAID";
      localOrder.isPaid = true;
      localOrder.paidAt = new Date();
      localOrder.paymentInfo = { ...localOrder.paymentInfo, webhook: payload, payment_id };
      localOrder.orderStatus = "Processing";
      await localOrder.save();
    } else {
      // handle other statuses if needed
      localOrder.paymentInfo = { ...localOrder.paymentInfo, webhook: payload };
      await localOrder.save();
    }

    // respond 200 to webhook
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
};

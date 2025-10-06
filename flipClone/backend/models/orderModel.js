import mongoose from "mongoose";

// Each order will contain multiple items
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    brandName: {
        type: String,
        // required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    saveForLater: {
      type: Boolean,
      default: false,
    },
  },
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String, required: false },
      addressType:{type: String, enum: ["Home","Work","Other"], require: true},
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    itemsPrice: { type: Number, required: true }, // subtotal
    // taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },

    
//---------------------------
    cashfreeOrderId: { type: String },

    paymentMethod: {
      type: Object,
      // enum: ["COD", "Card", "UPI", "NetBanking"],
      // required: true,
    },

    paymentStatus: { type: String, default: "PENDING" }, // PENDING / PAID / FAILED
    paymentInfo: { type: Object }, // store payment response or verification details

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
//--------------------------------------
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing","Confirmed", "Shipped", "Out For Delivery", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
//--------------------------------------------
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;






// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//     products: [
//         {
//             name: {
//                 type: String,
//             },
//             image: {
//                 type: String,
//             },
//             brandName: {
//                 type: String,
//             },
//             price: {
//                 type: Number,
//             },
//             discountPrice: {
//                 type: Number,
//             },
//             quantity: {
//                 type: Number,
//                 default: 1,
//             },
//             productId: {
//                 type: String,
//                 required: true,
//             },
//             seller: {
//                 type: mongoose.Schema.ObjectId,
//                 ref: "User",
//             },
//         },
//     ],
//     paymentId: {
//         type: String,
//         required: true,
//     },
//     buyer: {
//         type: mongoose.Schema.ObjectId,
//         ref: "User",
//         required: true,
//     },
//     shippingInfo: {
//         address: {
//             type: String,
//             required: true,
//         },
//         city: {
//             type: String,
//             required: true,
//         },
//         state: {
//             type: String,
//             required: true,
//         },
//         country: {
//             type: String,
//             required: true,
//         },
//         pincode: {
//             type: Number,
//             required: true,
//         },
//         phoneNo: {
//             type: Number,
//             required: true,
//         },
//         landmark: {
//             type: String,
//         },
//     },
//     orderStatus: {
//         type: String,
//         default: "Processing",
//     },
//     amount: {
//         type: Number,
//         default: 0,
//     },
//     deliveredAt: Date,
//     shippedAt: Date,
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// export default mongoose.model("Orders", orderSchema);

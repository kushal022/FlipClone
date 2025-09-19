import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    products: [
        {
            name: {
                type: String,
            },
            image: {
                type: String,
            },
            brandName: {
                type: String,
            },
            price: {
                type: Number,
            },
            discountPrice: {
                type: Number,
            },
            quantity: {
                type: Number,
                default: 1,
            },
            productId: {
                type: String,
                required: true,
            },
            seller: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        },
    ],
    paymentId: {
        type: String,
        required: true,
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
        phoneNo: {
            type: Number,
            required: true,
        },
        landmark: {
            type: String,
        },
    },
    orderStatus: {
        type: String,
        default: "Processing",
    },
    amount: {
        type: Number,
        default: 0,
    },
    deliveredAt: Date,
    shippedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Orders", orderSchema);

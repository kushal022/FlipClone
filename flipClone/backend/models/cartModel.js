import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    brandName: {
        type: String,
        required: true,
    },
    discountPrice: {
        type: Number,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    image: {
      type: String, 
    },
    saveForLater: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } 
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user = 1 cart
    },
    items: [cartItemSchema], // Cart items/products
    savedItems: [ cartItemSchema ], // Save for later items/products
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;

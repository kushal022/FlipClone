import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true, trim: true },
    lname: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: { type: String, required: true, minlength: 6 },

    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
    },

    addresses: [
      {
        label: { type: String, enum: ["home", "work", "other"], default: "Home" },
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    role: { type: String, enum: ["customer", "admin"], default: "customer" },

    pan: {
      number: {
        type: String,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
      },
      name: String,
    },

    wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
    //  cart: [
    //   {
    //     product: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
    //     quantity: { type: Number, default: 1, min: 1 },
    //   }
    // ],
     avatar: { type: String },

    refreshToken: String,

    isVerified: { type: Boolean, default: false },

    lastLogin: Date,
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);


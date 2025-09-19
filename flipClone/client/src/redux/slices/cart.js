import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Load data from localStorage (so we don't repeat code)
const loadFromLocalStorage = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

// Save data to localStorage
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const initialState = {
  cartItems: loadFromLocalStorage("cart"),
  saveLaterItems: loadFromLocalStorage("saveLater"),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  
  reducers: {
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing product
        state.cartItems[existingItemIndex].quantity = quantity;
      } else {
        state.cartItems.unshift({ ...product, quantity });
        toast.success("Product Added To Cart", {
          style: { top: "40px" },
        });
      }

      saveToLocalStorage("cart", state.cartItems);
    },

    removeItem: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload.productId
      );
      saveToLocalStorage("cart", state.cartItems);
    },

    addLater: (state, action) => {
      const product = action.payload;
      // Remove from cart first
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== product.productId
      );
      state.saveLaterItems.unshift(product);

      saveToLocalStorage("cart", state.cartItems);
      saveToLocalStorage("saveLater", state.saveLaterItems);

      toast.success("Product Saved To Later", {
        style: { top: "40px" },
      });
    },

    removeLater: (state, action) => {
      state.saveLaterItems = state.saveLaterItems.filter(
        (item) => item.productId !== action.payload.productId
      );
      saveToLocalStorage("saveLater", state.saveLaterItems);
    },

    moveToCart: (state, action) => {
      const product = action.payload;
      state.saveLaterItems = state.saveLaterItems.filter(
        (item) => item.productId !== product.productId
      );
      state.cartItems.unshift(product);

      saveToLocalStorage("cart", state.cartItems);
      saveToLocalStorage("saveLater", state.saveLaterItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      saveToLocalStorage("cart", []);
    },
  },
});

export const {
  addItem,
  removeItem,
  addLater,
  removeLater,
  moveToCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

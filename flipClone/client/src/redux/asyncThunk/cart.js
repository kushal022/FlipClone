// CART ASYNC THUNK:

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_SERVER_URL;

// ✅ Helper: get token from cookies
const getToken = () => {
  const auth = Cookies.get("auth");
  return auth ? JSON.parse(auth).token : null;
};

// ✅ Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ( item, { rejectWithValue }) => {
    try {
      const token = getToken();

      const res = await axios.post(
        `${API_URL}/api/v1/cart/add-to-cart`,
        item,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let cart = res.data.data
      res.data.success === true && 
      toast.success("Product added to cart!");
      res.data.success === false && 
      toast.success(`${res.data.message}`);
      return cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// ✅ dec- quantity
export const decQuantity = createAsyncThunk(
  "cart/decQuantity",
  async ( productId, { rejectWithValue }) => {
    try {
      const token = getToken();

      const res = await axios.post(
        `${API_URL}/api/v1/cart/dec-quantity`,
        productId,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let cart = res.data.data
      res.data.success === true && 
      toast.success("1 item removed from cart!");
      res.data.success === false && 
      toast.success(`${res.data.message}`);
      return cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();

      const res = await axios.get(`${API_URL}/api/v1/cart/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let cart = res.data.data
      // res.data.success === true && 
      // toast.success("Cart fetched successfully!");
      // res.data.success === false && 
      // toast.success(`${res.data.message}`);
      return cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Remove Item from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const token = getToken();

      const res = await axios.post(`${API_URL}/api/v1/cart/remove-from-cart`,
        productId, {
        headers: { Authorization: `Bearer ${token}` },
      });

        let cart = res.data.data
      res.data.success === true && 
      toast.success("Cart item deleted successfully!");
      res.data.success === false && 
      toast.success(`${res.data.message}`);
      return cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


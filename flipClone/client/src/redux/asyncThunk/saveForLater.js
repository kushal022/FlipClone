// CART ASYNC THUNK:

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_SERVER_URL;

const getToken = () => {
  const auth = Cookies.get("auth");
  return auth ? JSON.parse(auth).token : null;
};

// ✅ Add to SaveForLater
export const addToSaveForLater = createAsyncThunk(
  "cart/addToSaveForLater",
  async ( productId, { rejectWithValue }) => {
    try {
      const token = getToken();

      const res = await axios.post(
        `${API_URL}/api/v1/cart/save-for-later`,
        productId,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let cart = res.data.data
      res.data.success === true && 
      toast.success("Product added to SaveForLater!");
      res.data.success === false && 
      toast.error(`${res.data.message}`);
      return cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// ✅ MOVE ITEM BACK TO CART
export const moveBackToCart = createAsyncThunk(
  "cart/moveBackToCart",
  async ( productId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await axios.post(
        `${API_URL}/api/v1/cart/move-to-cart`,
        productId,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let cart = res.data.data
      res.data.success === true && 
      toast.success("Product moved to cart!");
      res.data.success === false && 
      toast.error(`${res.data.message}`);
      return cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ REMOVE FROM SAVE FOR LATER
export const removeFromSaveForLater = createAsyncThunk(
  "cart/removeFromSaveForLater",
  async (productId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await axios.post(`${API_URL}/api/v1/cart/remove-saved`,
        productId, 
        { headers: { Authorization: `Bearer ${token}` },
      });

      let cart = res.data.data
      res.data.success === true && 
      toast.success("Product Deleted successfully!");
      res.data.success === false && 
      toast.error(`${res.data.message}`);
      return cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);




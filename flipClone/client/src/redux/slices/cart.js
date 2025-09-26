import { createSlice, } from "@reduxjs/toolkit";
import { addToCart, decQuantity, fetchCart, removeFromCart } from "../asyncThunk/cart";


const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItem: [],
    isLoadingCart: false,
    addSuccess: false,
    error: null,
  },

  reducers: {
    clearCart: (state) => {
      state.cartItem = [];
    },

    setAddSuccess: (state, ) => {
      state.addSuccess = false;
    }
  },

  extraReducers: (builder) => {
    builder
      // ✅ ADD to Cart
      .addCase(addToCart.pending, (state,) => {
        state.isLoadingCart = true;
        state.addSuccess = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoadingCart = false;
        state.cartItem = action.payload;
        state.addSuccess = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoadingCart = false;
        state.error = action.payload;
      })

      // ✅ FETCH Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoadingCart = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoadingCart = false;
        state.cartItem = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoadingCart = false;
        state.error = action.payload;
      })

      // ✅ REMOVE Item
      .addCase(removeFromCart.pending, (state) => {
        state.isLoadingCart = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoadingCart = false;
        state.cartItem = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoadingCart = false;
        state.error = action.payload;
      })

      // ✅ REMOVE Item
      .addCase(decQuantity.pending, (state) => {
        state.isLoadingCart = true;
      })
      .addCase(decQuantity.fulfilled, (state, action) => {
        state.isLoadingCart = false;
        state.cartItem = action.payload;
      })
      .addCase(decQuantity.rejected, (state, action) => {
        state.isLoadingCart = false;
        state.error = action.payload;
      })
  },
});

export const { clearCart, setAddSuccess } = cartSlice.actions;
export default cartSlice.reducer;

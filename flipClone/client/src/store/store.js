import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/auth.js';
import cartReducer from '../redux/slices/cart.js';


const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer
  },
});

export default store;

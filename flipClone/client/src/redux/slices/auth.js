import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const initialState = {
  user: null,
  token: "",
  isAdmin: false,
  isLoading: true,
};

// Load data from cookies when app starts
const savedAuth = Cookies.get("auth");
if (savedAuth) {
  const parsed = JSON.parse(savedAuth);
  initialState.user = parsed.user;
  initialState.token = parsed.token;
  initialState.isAdmin = parsed.user?.role === 'admin';
}
initialState.isLoading = false;

// Create Auth Slice:
const authSlice = createSlice({
  name: "auth",
  initialState,
  
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAdmin = action.payload.user?.role === 'admin';
      Cookies.set("auth", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = "";
      state.isAdmin = false;
      Cookies.remove("auth");
      Cookies.remove("token");
      toast.success("Logged out Successfully!", { toastId: "LogOut" });
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;

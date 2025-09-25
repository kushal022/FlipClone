import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const initialState = {
  user: null,
  token: "",
  isAdmin: false,
  isLoading: true,
};

// Load auth from cookies safely
try {
  const savedAuth = Cookies.get("auth");
  if (savedAuth) {
    const parsed = JSON.parse(savedAuth);
    initialState.user = parsed.user;
    initialState.token = parsed.token;
    initialState.isAdmin = parsed.user?.role === "admin";
  }
} catch (err) {
  console.error("Failed to parse auth cookie:", err);
  Cookies.remove("auth"); // Remove bad cookie to avoid infinite crash
}
initialState.isLoading = false;

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.data;
      state.token = action.payload.accessToken;
      state.isAdmin = action.payload.data?.role === "admin";

      Cookies.set(
        "auth",
        JSON.stringify({
          user: action.payload.data,
          token: action.payload.accessToken,
        }),
        { expires: 7 }
      );
    },

    // updateAuth: (state, action) => {
    //   state.user = { ...state.user, ...action.payload };

    //   // Safely get cookie and update user
    //   let oldAuth = {};
    //   try {
    //     oldAuth = JSON.parse(Cookies.get("auth")) || {};
    //   } catch {
    //     oldAuth = {};
    //   }

    //   Cookies.set(
    //     "auth",
    //     JSON.stringify({
    //       ...oldAuth,
    //       user: { ...oldAuth.user, ...action.payload },
    //     }),
    //     { expires: 7 }
    //   );
    // },
   
    updateAuth: (state, action) => {
      state.user = action.payload;
      // console.log("Updated user in state:", action.payload);
      // Safely get cookie and update user
      let oldAuth = {};
      try {
        oldAuth = JSON.parse(Cookies.get("auth")) || {};
      } catch {
        oldAuth = {};
      }

      Cookies.set(
        "auth",
        JSON.stringify({
          ...oldAuth,
          user: action.payload,
        }),
        { expires: 7 }
      );
    },

    logout: (state) => {
      state.user = null;
      state.token = "";
      state.isAdmin = false;
      Cookies.remove("auth");
      toast.success("Logged out Successfully!", { toastId: "LogOut" });
    },
  },
});

export const { setAuth, updateAuth, logout } = authSlice.actions;
export default authSlice.reducer;

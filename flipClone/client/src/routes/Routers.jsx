import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import PageNotFound from "./../pages/PageNotFound";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Dashboard from "../pages/user/Dashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import Products from "../pages/Products/Products";
import ProductPage from "../components/ProductListing/ProductPage.jsx";
import Orders from "./../pages/user/Orders/Orders";
import Wishlist from "../pages/user/Wishlist/Wishlist";
import Cart from "../pages/user/Cart/Cart";
import Shipping from "../pages/user/Cart/Shipping";
import OrderSuccess from "../pages/user/Cart/OrderSuccess";
import OrderFailed from "../pages/user/Cart/OrderFailed";
import OrderDetails from "../pages/user/Orders/OrderDetails";
import AdminOrders from "../pages/Admin/AdminOrders";
import UpdateOrders from "../pages/Admin/UpdateOrders";
import DeleteAllOrder from "../pages/DeleteAllOrder.jsx";
import PlaceOrder from "../pages/user/Cart/PlaceOrder.jsx"
import Checkout from "../pages/user/Cart/Checkout.jsx";

const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<Products />} />
            {/* <Route path="/cart" element={<Cart />} /> */}

            <Route path="/shipping" element={<PrivateRoute />}>
                <Route path="" element={<Shipping />} />
                <Route path="confirm" element={<OrderSuccess />} />
                <Route path="failed" element={<OrderFailed />} />
            </Route>

            <Route path="product/:productId" element={<ProductPage />} />

            <Route path="/user" element={<PrivateRoute />}>
                <Route path=":id/dashboard/*" element={<Dashboard />} />
                <Route path=":id/cart" element={<Cart />} />
                <Route path="orders/order_details/:id" element={<OrderDetails />}/>
                <Route path=":id/wishlist" element={<Wishlist />} />
                <Route path=":id/orders" element={<Orders />} />
                <Route path="place-order" element={<PlaceOrder />} />
                <Route path="place-order/checkout" element={<Checkout />} />
                <Route path="payment/success" element={<OrderSuccess />} />
            </Route>

            <Route path="/admin" element={<AdminRoute />}>
                <Route path="dashboard/*" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/order_details/:id" element={<UpdateOrders />}/>
            </Route>

            <Route path="*" element={<PageNotFound />} />
            <Route path="/all-order/delete" element={<DeleteAllOrder />} />
        </Routes>
    );
};

export default Routers;

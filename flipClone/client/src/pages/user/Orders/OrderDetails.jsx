import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Tracker from "./Tracker";
import MinCategory from "../../../components/MinCategory";
import axios from "axios";
import Spinner from "../../../components/Spinner";
import { useSelector } from "react-redux";

const OrderDetails = () => {
  const params = useParams();
  const orderId = params.id;

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const auth = useSelector((s) => s.auth);

  // fetch order detail from server
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/v1/order/order_details/${orderId}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        console.log("Order Details Response:", response.data);

        if (response?.data?.success === true) {
          setOrderDetails(response.data.data);
        }
      } catch (error) {
        console.log("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && auth?.token) {
      fetchOrders();
    }
  }, [auth?.token, orderId]);

  // Extract data from orderDetails with proper fallbacks
  const orderItems = orderDetails?.orderItems || [];
  const buyer = orderDetails?.buyer || {};
  const shippingInfo = orderDetails?.shippingAddress || {};
  const paymentInfo = orderDetails?.paymentInfo || {};
  const createdAt = orderDetails?.createdAt;
  const orderStatus = orderDetails?.orderStatus || "Pending";
  const paymentStatus = orderDetails?.paymentStatus || "PENDING";
  const totalPrice = orderDetails?.totalPrice || 0;
  const itemsPrice = orderDetails?.itemsPrice || 0;
  const shippingPrice = orderDetails?.shippingPrice || 0;

  // Calculate active step for tracker
  const getActiveStep = () => {
    switch (orderStatus) {
      case "Delivered":
        return 4;
      case "Out For Delivery":
        return 3;
      case "Shipped":
        return 2;
      case "Processing":
      case "Confirmed":
        return 1;
      default: // Pending
        return 0;
    }
  };

  // Format buyer name
  const getBuyerName = () => {
    if (buyer.fname && buyer.lname) {
      return `${buyer.fname} ${buyer.lname}`;
    }
    return buyer.name || "Customer";
  };

  // Format address
  const getFullAddress = () => {
    if (!shippingInfo) return "Address not available";

    const parts = [
      shippingInfo.street,
      shippingInfo.landmark,
      shippingInfo.city,
      shippingInfo.state,
      shippingInfo.pincode,
      shippingInfo.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  if (loading) {
    return (
      <>
        <MinCategory />
        <div className="flex justify-center items-center min-h-96">
          <Spinner />
        </div>
      </>
    );
  }

  if (!orderDetails && !loading) {
    return (
      <>
        <MinCategory />
        <div className="flex flex-col items-center justify-center min-h-96">
          <h2 className="text-xl font-semibold text-gray-600">
            Order Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            The order you're looking for doesn't exist.
          </p>
          <Link
            to="/user/orders"
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <MinCategory />
      <main className="w-full py-2 sm:py-8">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto px-4">
          {/* Order Status Banner */}
          <div className="bg-white shadow rounded-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-gray-600 mt-1">
                  Order ID: {orderDetails?._id}
                </p>
                <p className="text-gray-600">
                  Cashfree Order ID: {orderDetails?.cashfreeOrderId}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    orderStatus === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : orderStatus === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {orderStatus}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : paymentStatus === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Payment: {paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Actions */}
          <div className="flex flex-col lg:flex-row bg-white shadow rounded-sm">
            <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  {shippingInfo.fullName || getBuyerName()}
                </h4>
                <p className="text-gray-700">{getFullAddress()}</p>
                <div className="flex gap-2 text-sm">
                  <p className="font-medium text-gray-600">Phone:</p>
                  <p className="text-gray-700">
                    {shippingInfo.phone || buyer.phone}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <p className="font-medium text-gray-600">Email:</p>
                  <p className="text-gray-700">{buyer.email}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  <p className="font-medium text-gray-600">Address Type:</p>
                  <p className="text-gray-700">
                    {shippingInfo.addressType || "Home"}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 p-6">
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="text-gray-900">
                    {new Date(createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Total:</span>
                  <span className="text-gray-900">
                    ₹{itemsPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">
                    ₹{shippingPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span className="text-gray-800">Total Amount:</span>
                  <span className="text-gray-900">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="mt-4">
                  <Link
                    to="#"
                    className="inline-block bg-white py-2 px-4 text-primaryBlue uppercase rounded-sm text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Download Invoice
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {orderItems.map((item) => {
            const { _id, image, name, discountPrice, quantity, productId } =
              item;

            return (
              <div
                className="flex flex-col lg:flex-row bg-white shadow rounded-sm p-6 gap-6"
                key={_id}
              >
                {/* Product Information */}
                <div className="flex flex-col lg:flex-row lg:w-1/2 gap-4">
                  <div className="w-full lg:w-32 h-32 flex-shrink-0">
                    <img
                      draggable="false"
                      className="h-full w-full object-contain rounded-lg"
                      src={image}
                      alt={name}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-product.png";
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Unit Price: ₹{discountPrice.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-semibold text-gray-900">
                        ₹{(quantity * discountPrice).toLocaleString()}
                      </span>
                      {productId?.price > discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{(quantity * productId.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Product Specifications */}
                    {productId && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Product ID: {productId._id}</p>
                        <p>
                          Original Price: ₹{productId.price.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Tracking */}
                <div className="lg:w-1/2 lg:pl-6 lg:border-l">
                  <Tracker
                    orderOn={createdAt}
                    activeStep={getActiveStep()}
                    orderStatus={orderStatus}
                  />

                  {/* Payment Information */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Payment Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-medium ${
                            paymentStatus === "PAID"
                              ? "text-green-600"
                              : paymentStatus === "FAILED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">
                          Cashfree Order ID:
                        </span>
                        <span className="font-medium">
                          {orderDetails?.cashfreeOrderId}
                        </span>
                      </p>
                      {paymentInfo?.order_amount && (
                        <p className="flex justify-between">
                          <span className="text-gray-600">Order Amount:</span>
                          <span className="font-medium">
                            ₹{(paymentInfo.order_amount / 100).toLocaleString()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default OrderDetails;

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import MinCategory from "../../components/MinCategory";
import axios from "axios";
import Tracker from "./../user/Orders/Tracker";
import Spinner from "../../components/Spinner";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const UpdateOrders = () => {
  const params = useParams();
  const orderId = params.id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState("");
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    shippingCarrier: "",
  });
  const auth = useSelector((s) => s.auth);

  // Fetch order details from server
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching order details for:", orderId);

        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/v1/order/admin-order-details/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        console.log("Order details response:", response.data);

        if (response?.data?.success) {
          setOrderDetails(response.data.data);
          setStatus(response.data.data.orderStatus);
        } else {
          toast.error("Failed to load order details");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error(
          error.response?.data?.message || "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId && auth?.token) {
      fetchOrderDetails();
    }
  }, [auth?.token, orderId]);

  // Handle order status update
  const updateOrderSubmitHandler = async (e) => {
    e.preventDefault();

    if (!status) {
      toast.error("Please select a status");
      return;
    }

    // Don't update if status is the same
    if (status === orderDetails?.orderStatus) {
      toast.info("Order status is already set to " + status);
      return;
    }

    try {
      setUpdating(true);

      const updateData = {
        status,
        orderId,
      };

      // Add tracking info if status is Shipped
      if (status === "Shipped") {
        if (!trackingInfo.trackingNumber) {
          toast.error("Please enter tracking number for shipped orders");
          setUpdating(false);
          return;
        }
        updateData.trackingNumber = trackingInfo.trackingNumber;
        updateData.shippingCarrier = trackingInfo.shippingCarrier || "Standard";
      }

      console.log("Updating order with:", updateData);

      const res = await axios.patch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/v1/order/update/order-status/${orderId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      console.log("Update response:", res.data);

      if (res.data.success) {
        toast.success(`Order status updated to ${status} successfully!`);

        // Update local state
        setOrderDetails((prev) => ({
          ...prev,
          orderStatus: status,
          trackingInfo:
            status === "Shipped"
              ? {
                  trackingNumber: trackingInfo.trackingNumber,
                  shippingCarrier: trackingInfo.shippingCarrier,
                  shippedAt: new Date().toISOString(),
                }
              : prev.trackingInfo,
        }));

        // Clear tracking info after successful update
        if (status === "Shipped") {
          setTrackingInfo({ trackingNumber: "", shippingCarrier: "" });
        }

        // Navigate back to orders with refresh flag
        navigate('/admin/orders', { state: { refresh: true } });
      } else {
        toast.error(res.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Calculate active step for tracker - FIXED VERSION
  const getActiveStep = () => {
    if (!orderDetails?.orderStatus) return 0;

    console.log("Current order status:", orderDetails.orderStatus);

    const statusMap = {
      Pending: 0,
      Confirmed: 1,
      Processing: 2,
      Shipped: 3,
      "Out For Delivery": 4,
      Delivered: 5,
    };

    const step = statusMap[orderDetails.orderStatus] || 0;
    console.log("Calculated active step:", step);
    return step;
  };

  // Get available status options based on current status
  const getAvailableStatuses = () => {
    if (!orderDetails?.orderStatus) return [];

    const statusFlow = {
      Pending: ["Confirmed", "Processing", "Cancelled"],
      Confirmed: ["Processing", "Shipped", "Cancelled"],
      Processing: ["Shipped", "Cancelled"],
      Shipped: ["Out For Delivery", "Delivered"],
      "Out For Delivery": ["Delivered"],
      Delivered: [],
      Cancelled: [],
      Returned: [],
    };

    return statusFlow[orderDetails.orderStatus] || [];
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
            The order you're looking for doesn't exist or you don't have access.
          </p>
          <Link
            to="/admin/orders"
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </Link>
        </div>
      </>
    );
  }

  const availableStatuses = getAvailableStatuses();

  return (
    <>
      <MinCategory />
      <main className="w-full py-4 sm:py-6">
        <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Update Order</h1>
              <p className="text-gray-600 mt-1">
                Order ID: {orderDetails?.cashfreeOrderId || orderDetails?._id}
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
            >
              <ArrowBackIosIcon sx={{ fontSize: "14px" }} />
              <span className="text-sm">Back to Orders</span>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                <div className="space-y-3 text-sm">
                  <h4 className="font-medium text-gray-900">
                    {orderDetails?.shippingAddress?.fullName || "N/A"}
                  </h4>
                  <p className="text-gray-700">
                    {orderDetails?.shippingAddress?.street || "N/A"}
                    {orderDetails?.shippingAddress?.landmark &&
                      `, ${orderDetails.shippingAddress.landmark}`}
                  </p>
                  <p className="text-gray-700">
                    {orderDetails?.shippingAddress?.city || "N/A"},{" "}
                    {orderDetails?.shippingAddress?.state || "N/A"} -{" "}
                    {orderDetails?.shippingAddress?.pincode || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    {orderDetails?.shippingAddress?.country || "N/A"}
                  </p>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600">Phone:</span>
                    <span className="text-gray-700">
                      {orderDetails?.shippingAddress?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600">
                      Address Type:
                    </span>
                    <span className="text-gray-700">
                      {orderDetails?.shippingAddress?.addressType || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Order Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buyer:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails?.buyer?.fname || "N/A"}{" "}
                      {orderDetails?.buyer?.lname || ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails?.buyer?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails?.createdAt
                        ? new Date(orderDetails.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium ${
                        orderDetails?.paymentStatus === "PAID"
                          ? "text-green-600"
                          : orderDetails?.paymentStatus === "PENDING"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {orderDetails?.paymentStatus || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-gray-900">
                      ₹{orderDetails?.totalPrice?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status Section */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Update Form */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Update Order Status
                </h3>
                <form onSubmit={updateOrderSubmitHandler} className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Current Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        orderDetails?.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : orderDetails?.orderStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : orderDetails?.orderStatus === "Shipped"
                          ? "bg-orange-100 text-orange-800"
                          : orderDetails?.orderStatus === "Out For Delivery"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {orderDetails?.orderStatus || "Pending"}
                    </span>
                  </div>

                  <FormControl fullWidth>
                    <InputLabel id="order-status-select-label">
                      Update Status
                    </InputLabel>
                    <Select
                      labelId="order-status-select-label"
                      id="order-status-select"
                      value={status}
                      label="Update Status"
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={availableStatuses.length === 0 || updating}
                    >
                      {availableStatuses.map((statusOption) => (
                        <MenuItem key={statusOption} value={statusOption}>
                          {statusOption}
                        </MenuItem>
                      ))}
                      {availableStatuses.length === 0 && (
                        <MenuItem value="" disabled>
                          No further updates available
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  {/* Tracking Info for Shipping */}
                  {status === "Shipped" && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        Tracking Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tracking Number *
                          </label>
                          <input
                            type="text"
                            value={trackingInfo.trackingNumber}
                            onChange={(e) =>
                              setTrackingInfo((prev) => ({
                                ...prev,
                                trackingNumber: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter tracking number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shipping Carrier
                          </label>
                          <select
                            value={trackingInfo.shippingCarrier}
                            onChange={(e) =>
                              setTrackingInfo((prev) => ({
                                ...prev,
                                shippingCarrier: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select carrier</option>
                            <option value="DTDC">DTDC</option>
                            <option value="Blue Dart">Blue Dart</option>
                            <option value="Delhivery">Delhivery</option>
                            <option value="Amazon Shipping">
                              Amazon Shipping
                            </option>
                            <option value="Standard">Standard</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      updating || availableStatuses.length === 0 || !status
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-6 py-2 text-white font-medium rounded-lg transition-colors"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </form>
              </div>

              {/* Order Progress Tracker */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
                <Tracker
                  orderOn={orderDetails?.createdAt}
                  activeStep={getActiveStep()}
                  orderStatus={orderDetails?.orderStatus}
                />

                {/* Tracking Info Display */}
                {orderDetails?.trackingInfo && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Tracking Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Tracking Number:</span>{" "}
                        {orderDetails.trackingInfo.trackingNumber}
                      </p>
                      <p>
                        <span className="font-medium">Carrier:</span>{" "}
                        {orderDetails.trackingInfo.shippingCarrier}
                      </p>
                      {orderDetails.trackingInfo.shippedAt && (
                        <p>
                          <span className="font-medium">Shipped On:</span>{" "}
                          {new Date(
                            orderDetails.trackingInfo.shippedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderDetails?.orderItems?.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-product.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      Brand: {item.brandName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{(item.discountPrice * item.quantity).toLocaleString()}
                    </p>
                    {item.price > item.discountPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UpdateOrders;

// import { useEffect, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import MinCategory from "../../components/MinCategory";
// import axios from "axios";
// import Tracker from "./../user/Orders/Tracker";
// import Spinner from "../../components/Spinner";
// import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
// import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";

// const UpdateOrders = () => {
//   const params = useParams();
//   const orderId = params.id;
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [updating, setUpdating] = useState(false);
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [status, setStatus] = useState("");
//   const [trackingInfo, setTrackingInfo] = useState({
//     trackingNumber: "",
//     shippingCarrier: "",
//   });
//   const auth = useSelector((s) => s.auth);

//   // Fetch order details from server
//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/api/v1/order/admin-order-details/${orderId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${auth?.token}`,
//             },
//           }
//         );

//         if (response?.data?.success) {
//           setOrderDetails(response.data.data);
//           setStatus(response.data.data.orderStatus);
//         }
//       } catch (error) {
//         console.error("Error fetching order details:", error);
//         toast.error("Failed to load order details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId && auth?.token) {
//       fetchOrderDetails();
//     }
//   }, [auth?.token, orderId]);

//   // Handle order status update
//   const updateOrderSubmitHandler = async (e) => {
//     e.preventDefault();

//     if (!status) {
//       toast.error("Please select a status");
//       return;
//     }

//     try {
//       setUpdating(true);

//       const updateData = {
//         status,
//         orderId,
//       };

//       // Add tracking info if status is Shipped
//       if (status === "Shipped" && trackingInfo.trackingNumber) {
//         updateData.trackingNumber = trackingInfo.trackingNumber;
//         updateData.shippingCarrier = trackingInfo.shippingCarrier;
//       }

//       const res = await axios.patch(
//         `${
//           import.meta.env.VITE_SERVER_URL
//         }/api/v1/order/update/order-status/${orderId}`,
//         updateData,
//         {
//           headers: {
//             Authorization: `Bearer ${auth?.token}`,
//           },
//         }
//       );

//       if (res.data.success) {
//         toast.success(`Order status updated to ${status} successfully!`);
//         setOrderDetails((prev) => ({
//           ...prev,
//           orderStatus: status,
//           trackingInfo:
//             status === "Shipped"
//               ? {
//                   trackingNumber: trackingInfo.trackingNumber,
//                   shippingCarrier: trackingInfo.shippingCarrier,
//                   shippedAt: new Date().toISOString(),
//                 }
//               : prev.trackingInfo,
//         }));

//         // Clear tracking info after successful update
//         if (status === "Shipped") {
//           setTrackingInfo({ trackingNumber: "", shippingCarrier: "" });
//         }
//       }
//     } catch (error) {
//       console.error("Error updating order:", error);
//       toast.error(
//         error.response?.data?.message || "Failed to update order status"
//       );
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Calculate active step for tracker
//   const getActiveStep = () => {
//     if (!orderDetails) return 0;

//     switch (orderDetails.orderStatus) {
//       case "Delivered":
//         return 4;
//       case "Out For Delivery":
//         return 3;
//       case "Shipped":
//         return 2;
//       case "Processing":
//       case "Confirmed":
//         return 1;
//       default: // Pending
//         return 0;
//     }
//   };

//   // Get available status options based on current status
//   const getAvailableStatuses = () => {
//     const statusFlow = {
//       Pending: ["Confirmed", "Processing", "Cancelled"],
//       Confirmed: ["Processing", "Shipped", "Cancelled"],
//       Processing: ["Shipped", "Cancelled"],
//       Shipped: ["Out For Delivery", "Delivered"],
//       "Out For Delivery": ["Delivered"],
//       Delivered: [], // No further updates after delivered
//       Cancelled: [], // No updates after cancelled
//       Returned: [], // No updates after returned
//     };

//     return statusFlow[orderDetails?.orderStatus] || [];
//   };

//   if (loading) {
//     return (
//       <>
//         <MinCategory />
//         <div className="flex justify-center items-center min-h-96">
//           <Spinner />
//         </div>
//       </>
//     );
//   }

//   if (!orderDetails && !loading) {
//     return (
//       <>
//         <MinCategory />
//         <div className="flex flex-col items-center justify-center min-h-96">
//           <h2 className="text-xl font-semibold text-gray-600">
//             Order Not Found
//           </h2>
//           <p className="text-gray-500 mt-2">
//             The order you're looking for doesn't exist.
//           </p>
//           <Link
//             to="/seller/orders"
//             className="mt-4 text-blue-600 hover:text-blue-800"
//           >
//             Back to Orders
//           </Link>
//         </div>
//       </>
//     );
//   }

//   const availableStatuses = getAvailableStatuses();

//   return (
//     <>
//       <MinCategory />
//       <main className="w-full py-4 sm:py-6">
//         <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Update Order</h1>
//               <p className="text-gray-600 mt-1">
//                 Order ID: {orderDetails?.cashfreeOrderId}
//               </p>
//             </div>
//             <Link
//               to="/admin/orders"
//               className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
//             >
//               <ArrowBackIosIcon sx={{ fontSize: "14px" }} />
//               <span className="text-sm">Back to Orders</span>
//             </Link>
//           </div>

//           {/* Order Summary */}
//           <div className="bg-white rounded-lg shadow border p-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Delivery Address */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
//                 <div className="space-y-3 text-sm">
//                   <h4 className="font-medium text-gray-900">
//                     {orderDetails?.shippingAddress?.fullName}
//                   </h4>
//                   <p className="text-gray-700">
//                     {orderDetails?.shippingAddress?.street}
//                     {orderDetails?.shippingAddress?.landmark &&
//                       `, ${orderDetails.shippingAddress.landmark}`}
//                   </p>
//                   <p className="text-gray-700">
//                     {orderDetails?.shippingAddress?.city},{" "}
//                     {orderDetails?.shippingAddress?.state} -{" "}
//                     {orderDetails?.shippingAddress?.pincode}
//                   </p>
//                   <p className="text-gray-700">
//                     {orderDetails?.shippingAddress?.country}
//                   </p>
//                   <div className="flex gap-2">
//                     <span className="font-medium text-gray-600">Phone:</span>
//                     <span className="text-gray-700">
//                       {orderDetails?.shippingAddress?.phone}
//                     </span>
//                   </div>
//                   <div className="flex gap-2">
//                     <span className="font-medium text-gray-600">
//                       Address Type:
//                     </span>
//                     <span className="text-gray-700">
//                       {orderDetails?.shippingAddress?.addressType}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Information */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">
//                   Order Information
//                 </h3>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Buyer:</span>
//                     <span className="font-medium text-gray-900">
//                       {orderDetails?.buyer?.fname} {orderDetails?.buyer?.lname}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Email:</span>
//                     <span className="font-medium text-gray-900">
//                       {orderDetails?.buyer?.email}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Order Date:</span>
//                     <span className="font-medium text-gray-900">
//                       {new Date(orderDetails?.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Payment Status:</span>
//                     <span
//                       className={`font-medium ${
//                         orderDetails?.paymentStatus === "PAID"
//                           ? "text-green-600"
//                           : orderDetails?.paymentStatus === "PENDING"
//                           ? "text-yellow-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {orderDetails?.paymentStatus}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Amount:</span>
//                     <span className="font-bold text-gray-900">
//                       ₹
//                       {orderDetails?.sellerStats?.totalAmount?.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Update Status Section */}
//           <div className="bg-white rounded-lg shadow border p-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Status Update Form */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">
//                   Update Order Status
//                 </h3>
//                 <form onSubmit={updateOrderSubmitHandler} className="space-y-4">
//                   <div className="flex gap-4 items-center">
//                     <span className="text-sm font-medium text-gray-600">
//                       Current Status:
//                     </span>
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         orderDetails?.orderStatus === "Delivered"
//                           ? "bg-green-100 text-green-800"
//                           : orderDetails?.orderStatus === "Cancelled"
//                           ? "bg-red-100 text-red-800"
//                           : orderDetails?.orderStatus === "Shipped"
//                           ? "bg-orange-100 text-orange-800"
//                           : "bg-blue-100 text-blue-800"
//                       }`}
//                     >
//                       {orderDetails?.orderStatus}
//                     </span>
//                   </div>

//                   <FormControl fullWidth>
//                     <InputLabel id="order-status-select-label">
//                       Update Status
//                     </InputLabel>
//                     <Select
//                       labelId="order-status-select-label"
//                       id="order-status-select"
//                       value={status}
//                       label="Update Status"
//                       onChange={(e) => setStatus(e.target.value)}
//                       disabled={availableStatuses.length === 0 || updating}
//                     >
//                       {availableStatuses.map((statusOption) => (
//                         <MenuItem key={statusOption} value={statusOption}>
//                           {statusOption}
//                         </MenuItem>
//                       ))}
//                       {availableStatuses.length === 0 && (
//                         <MenuItem value="" disabled>
//                           No further updates available
//                         </MenuItem>
//                       )}
//                     </Select>
//                   </FormControl>

//                   {/* Tracking Info for Shipping */}
//                   {status === "Shipped" && (
//                     <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
//                       <h4 className="font-medium text-gray-900">
//                         Tracking Information
//                       </h4>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Tracking Number
//                           </label>
//                           <input
//                             type="text"
//                             value={trackingInfo.trackingNumber}
//                             onChange={(e) =>
//                               setTrackingInfo((prev) => ({
//                                 ...prev,
//                                 trackingNumber: e.target.value,
//                               }))
//                             }
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Enter tracking number"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Shipping Carrier
//                           </label>
//                           <select
//                             value={trackingInfo.shippingCarrier}
//                             onChange={(e) =>
//                               setTrackingInfo((prev) => ({
//                                 ...prev,
//                                 shippingCarrier: e.target.value,
//                               }))
//                             }
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             <option value="">Select carrier</option>
//                             <option value="DTDC">DTDC</option>
//                             <option value="Blue Dart">Blue Dart</option>
//                             <option value="Delhivery">Delhivery</option>
//                             <option value="Amazon Shipping">
//                               Amazon Shipping
//                             </option>
//                             <option value="Standard">Standard</option>
//                             <option value="Other">Other</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <button
//                     type="submit"
//                     disabled={
//                       updating || availableStatuses.length === 0 || !status
//                     }
//                     className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-6 py-2 text-white font-medium rounded-lg transition-colors"
//                   >
//                     {updating ? "Updating..." : "Update Status"}
//                   </button>
//                 </form>
//               </div>

//               {/* Order Progress Tracker */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
//                 <Tracker
//                   orderOn={orderDetails?.createdAt}
//                   activeStep={getActiveStep()}
//                   orderStatus={orderDetails?.orderStatus}
//                 />

//                 {/* Tracking Info Display */}
//                 {orderDetails?.trackingInfo && (
//                   <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//                     <h4 className="font-medium text-blue-900 mb-2">
//                       Tracking Information
//                     </h4>
//                     <div className="space-y-1 text-sm">
//                       <p>
//                         <span className="font-medium">Tracking Number:</span>{" "}
//                         {orderDetails.trackingInfo.trackingNumber}
//                       </p>
//                       <p>
//                         <span className="font-medium">Carrier:</span>{" "}
//                         {orderDetails.trackingInfo.shippingCarrier}
//                       </p>
//                       {orderDetails.trackingInfo.shippedAt && (
//                         <p>
//                           <span className="font-medium">Shipped On:</span>{" "}
//                           {new Date(
//                             orderDetails.trackingInfo.shippedAt
//                           ).toLocaleDateString()}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Order Items */}
//           <div className="bg-white rounded-lg shadow border p-6">
//             <h3 className="text-lg font-semibold mb-4">Order Items</h3>
//             <div className="space-y-4">
//               {orderDetails?.orderItems?.map((item, index) => (
//                 <div
//                   key={item._id || index}
//                   className="flex items-center gap-4 p-4 border rounded-lg"
//                 >
//                   <div className="w-20 h-20 flex-shrink-0">
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       className="w-full h-full object-contain rounded"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="font-medium text-gray-900">{item.name}</h4>
//                     <p className="text-sm text-gray-600">
//                       Brand: {item.brandName}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Quantity: {item.quantity}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-semibold text-gray-900">
//                       ₹{(item.discountPrice * item.quantity).toLocaleString()}
//                     </p>
//                     {item.price > item.discountPrice && (
//                       <p className="text-sm text-gray-500 line-through">
//                         ₹{(item.price * item.quantity).toLocaleString()}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// };

// export default UpdateOrders;

// // import { useEffect, useState } from "react";
// // import { Link, useParams } from "react-router-dom";
// // import MinCategory from "../../components/MinCategory";
// // import axios from "axios";
// // import Tracker from "./../user/Orders/Tracker";
// // import Spinner from "../../components/Spinner";
// // import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
// // import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
// // import { useSelector } from "react-redux";

// // const UpdateOrders = () => {
// //   const params = useParams();
// //   const orderId = params.id;

// //   const [loading, setLoading] = useState(false);
// //   const [UpdateOrders, setUpdateOrders] = useState([]);
// //   const [status, setStatus] = useState("");
// //   const  auth  = useSelector(s => s.auth);
// //   const [reload, setReload] = useState(false);

// //   useEffect(() => {
// //     // fetch order detail from server
// //     const fetchOrders = async () => {
// //       try {
// //         setLoading(true);
// //         const response = await axios.get(
// //           `${
// //             import.meta.env.VITE_SERVER_URL
// //           }/api/v1/order/admin-order-detail?orderId=${orderId}`,
// //           {
// //             headers: {
// //               Authorization: `Bearer ${auth?.token}`,
// //             },
// //           }
// //         );
// //         if (response?.data?.orderDetails) {
// //           setUpdateOrders(...response.data.orderDetails);
// //           setLoading(false);
// //         }
// //       } catch (error) {
// //         console.log(error);
// //         setLoading(false);
// //       }
// //     };
// //     fetchOrders();
// //   }, [auth?.token, orderId, reload]);

// //   const amount = UpdateOrders?.amount;
// //   const orderItems = UpdateOrders?.products;
// //   const buyer = UpdateOrders?.buyer;
// //   const paymentId = UpdateOrders?.paymentId;
// //   const shippingInfo = UpdateOrders?.shippingInfo;
// //   const createdAt = UpdateOrders?.createdAt;
// //   const orderStatus = UpdateOrders?.orderStatus;

// //   const updateOrderSubmitHandler = async (e) => {
// //     try {
// //       e.preventDefault();
// //       const res = await axios.patch(
// //         `${import.meta.env.VITE_SERVER_URL}/api/v1/order/update/order-status`,
// //         { status, orderId },
// //         {
// //           headers: { Authorization:  `Bearer ${auth?.token}` },
// //         }
// //       );
// //       if (res.status === 200) {
// //         setReload(!reload);
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   return (
// //     <>
// //       <SeoData title="Order Details | Flipkart" />

// //       <MinCategory />
// //       <main className="w-full py-2 sm:py-8">
// //         {loading ? (
// //           <Spinner />
// //         ) : (
// //           <>
// //             <div className="flex flex-col gap-4 max-w-6xl mx-auto">
// //               <div className="flex flex-col sm:flex-row bg-white shadow rounded-sm min-w-full">
// //                 <div className="sm:w-1/2 border-r">
// //                   <div className="flex flex-col gap-3 my-8 mx-10">
// //                     <h3 className=" text-md font-[600]">Delivery Address</h3>
// //                     <h4 className="font-medium">{buyer?.name}</h4>
// //                     <p className="text-sm">{`${shippingInfo?.address}, ${shippingInfo?.city}, ${shippingInfo?.state} - ${shippingInfo?.pincode}`}</p>
// //                     <div className="flex gap-2 text-sm">
// //                       <p className="font-medium">Email</p>
// //                       <p>{buyer?.email}</p>
// //                     </div>
// //                     <div className="flex gap-2 text-sm">
// //                       <p className="font-medium">Phone Number</p>
// //                       <p>{shippingInfo?.phoneNo}</p>
// //                     </div>
// //                   </div>
// //                 </div>
// //                 <div className="w-full sm:w-1/2">
// //                   <div className="flex flex-col gap-5 my-8 mx-10">
// //                     <div className="flex items-center justify-between">
// //                       <h3 className=" text-md font-[600]">Update Status</h3>
// //                       <Link
// //                         to="/admin/orders"
// //                         className="ml-1 flex items-center gap-0 font-medium text-primaryBlue uppercase"
// //                       >
// //                         <ArrowBackIosIcon sx={{ fontSize: "14px" }} />
// //                         <span className="text-[12px]">Go Back</span>
// //                       </Link>
// //                     </div>
// //                     <div>
// //                       <form
// //                         onSubmit={updateOrderSubmitHandler}
// //                         className="flex flex-col gap-3 items-start justify-between"
// //                       >
// //                         <div className="flex gap-2">
// //                           <p className="text-sm font-medium">Current Status:</p>
// //                           <p className="text-sm">{orderStatus}</p>
// //                         </div>
// //                         <FormControl fullWidth sx={{ marginTop: 1 }}>
// //                           <InputLabel id="order-status-select-label">
// //                             Status
// //                           </InputLabel>
// //                           <Select
// //                             labelId="order-status-select-label"
// //                             id="order-status-select"
// //                             value={status}
// //                             label="Status"
// //                             onChange={(e) => setStatus(e.target.value)}
// //                             className="w-[50%]"
// //                           >
// //                             <MenuItem value={"Shipped"}>Shipped</MenuItem>

// //                             <MenuItem value={"Out For Delivery"}>
// //                               Out For Delivery
// //                             </MenuItem>

// //                             <MenuItem value={"Delivered"}>Delivered</MenuItem>
// //                           </Select>
// //                         </FormControl>
// //                         <button
// //                           type="submit"
// //                           className="bg-orange px-4 py-2 text-[14px] text-white hover:font-medium rounded shadow hover:shadow-lg"
// //                         >
// //                           Update
// //                         </button>
// //                       </form>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               {orderItems?.map((item) => {
// //                 const { _id, image, name, discountPrice, quantity, seller } =
// //                   item;

// //                 return (
// //                   <div
// //                     className="flex flex-col sm:flex-row min-w-full shadow rounded-sm bg-white px-2 py-5"
// //                     key={_id}
// //                   >
// //                     <div className="flex flex-col sm:flex-row sm:w-1/2 gap-2">
// //                       <div className="w-full sm:w-32 h-20">
// //                         <img
// //                           draggable="false"
// //                           className="h-full w-full object-contain"
// //                           src={image}
// //                           alt={name}
// //                         />
// //                       </div>
// //                       <div className="flex flex-col gap-1 overflow-hidden">
// //                         <p className="text-sm">
// //                           {name.length > 60
// //                             ? `${name.substring(0, 60)}...`
// //                             : name}
// //                         </p>
// //                         <p className="text-xs text-gray-600 mt-2">
// //                           Quantity: {quantity}
// //                         </p>
// //                         <p className="text-xs text-gray-600">
// //                           Seller: {seller?.name}
// //                         </p>
// //                         <span className="font-medium">
// //                           ₹{(quantity * discountPrice).toLocaleString()}
// //                         </span>
// //                         <span className="text-xs text-gray-600">
// //                           Payment Id: {paymentId}
// //                         </span>
// //                       </div>
// //                     </div>

// //                     <div className="flex flex-col w-full sm:w-1/2">
// //                       <Tracker
// //                         orderOn={createdAt}
// //                         activeStep={
// //                           orderStatus === "Delivered"
// //                             ? 3
// //                             : orderStatus === "Out For Delivery"
// //                             ? 2
// //                             : orderStatus === "Shipped"
// //                             ? 1
// //                             : 0
// //                         }
// //                       />
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //           </>
// //         )}
// //       </main>
// //     </>
// //   );
// // };

// // export default UpdateOrders;

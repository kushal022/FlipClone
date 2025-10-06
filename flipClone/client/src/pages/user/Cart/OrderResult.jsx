import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PendingIcon from "@mui/icons-material/Pending";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axios from "axios";
import Spinner from "../../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchCart } from "../../../redux/asyncThunk/cart";

const OrderSuccess = () => {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const { cartItems } = useSelector((s) => s.cart);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get("order_id");
  const payment_id = searchParams.get("payment_id");

  const [time, setTime] = useState(15);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Payment status configuration
  const paymentConfig = {
    PAID: {
      title: "Payment Successful!",
      subtitle: "Thank you for your purchase! Your order has been confirmed.",
      icon: CheckCircleOutlineIcon,
      iconColor: "text-green-500",
      titleColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      showTimer: true,
      autoRedirect: true,
    },
    PENDING: {
      title: "Payment Processing",
      subtitle: "Your payment is being processed. This may take a few moments.",
      icon: HourglassEmptyIcon,
      iconColor: "text-blue-500",
      titleColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      showTimer: true,
      autoRedirect: true,
    },
    FAILED: {
      title: "Payment Failed",
      subtitle: "Unfortunately, your payment was not successful. Please try again.",
      icon: ErrorOutlineIcon,
      iconColor: "text-red-500",
      titleColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      showTimer: false,
      autoRedirect: false,
    },
    CANCELLED: {
      title: "Payment Cancelled",
      subtitle: "You cancelled the payment process.",
      icon: ErrorOutlineIcon,
      iconColor: "text-orange-500",
      titleColor: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      showTimer: false,
      autoRedirect: false,
    },
    UNKNOWN: {
      title: "Payment Status Unknown",
      subtitle: "We're unable to verify your payment status at the moment.",
      icon: PendingIcon,
      iconColor: "text-gray-500",
      titleColor: "text-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      showTimer: false,
      autoRedirect: false,
    }
  };

  const updateCartStock = async (orderId) => {
    try {
      const res = await axios.post(
         `${import.meta.env.VITE_SERVER_URL}/api/v1/order/update_cart_stock`,
         {orderId},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
          // timeout: 10000, // 10 second timeout
        }
      )
      if(res.data.success === true) {
        console.log("cart and stock updated")
        return true;
      }
    } catch (error) {
      console.log("error in update cart and stock: " ,error)
    }
  }

  useEffect(()=>{
    const timer = setTimeout(()=>{
      dispatch(fetchCart())
    }, 1500);
    return () => clearTimeout(timer)
  },[paymentStatus, orderDetails])


  //? Verify payment status with retry logic
  const verifyPayment = async (isRetry = false) => {
    if (!order_id) {
      toast.error("Order ID not found");
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) setLoading(true);
      
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/order/status/${order_id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("Payment verification response:", res.data);

      if (res.data.success && res.data.data) {
        const orderData = res.data.data;
        const currentPaymentStatus = orderData.paymentStatus;
        
        setPaymentStatus(currentPaymentStatus);
        setOrderDetails(orderData);

        // Show appropriate toast message
        switch (currentPaymentStatus) {
          case "PAID":
            toast.success("🎉 Payment successful! Order confirmed.");
            // Clear cart on successful payment
            // You might want to dispatch an action to clear cart here
            updateCartStock(orderData._id)
            dispatch(fetchCart())

            break;
          case "PENDING":
            if (retryCount < maxRetries) {
              toast.info("⏳ Payment still processing...");
              // Retry after delay for pending payments
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                verifyPayment(true);
              }, 3000); // Retry every 3 seconds
            } else {
              toast.info("Payment is taking longer than usual. Please check your orders page.");
            }
            break;
          case "FAILED":
            toast.error("❌ Payment failed. Please try again.");
            break;
          default:
            toast.warning("Payment status unknown.");
        }

        setVerificationComplete(true);
      } else {
        toast.error("Failed to verify payment status");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      
      if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        // Server error, retry
        if (retryCount < maxRetries) {
          toast.warning(`Retrying... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            verifyPayment(true);
          }, 2000);
        } else {
          toast.error("Service temporarily unavailable. Please check your orders later.");
          setVerificationComplete(true);
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to verify payment");
        setVerificationComplete(true);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  

  // Initial payment verification
  useEffect(() => {
    verifyPayment();
  }, [order_id, auth?.token]);

  // Timer for auto-redirect
  const intervalId = useRef(null);
  useEffect(() => {
    const config = paymentConfig[paymentStatus] || paymentConfig.UNKNOWN;
    
    if (!loading && verificationComplete && config.autoRedirect && config.showTimer) {
      intervalId.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId.current);
            handleRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [loading, verificationComplete, paymentStatus]);

  // Manual redirect handler
  const handleRedirect = (path = "/user/orders") => {
    navigate(path);
  };

  // Retry payment verification
  const handleRetryVerification = () => {
    setRetryCount(0);
    setVerificationComplete(false);
    setTime(15);
    verifyPayment();
  };

  // Continue to checkout for failed payments
  const handleRetryPayment = () => {
    if (orderDetails) {
      // You might want to redirect to a retry payment page or cart
      navigate("/user/cart");
    } else {
      navigate("/user/cart");
    }
  };

  // Render order summary for successful payments
  const renderOrderSummary = () => {
    if (!orderDetails || paymentStatus !== "PAID") return null;

    return (
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderDetails.cashfreeOrderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-semibold text-green-600">
              ₹{orderDetails.totalPrice?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">
              {orderDetails.orderItems?.length} item(s)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              orderDetails.orderStatus === "Confirmed" 
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {orderDetails.orderStatus}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <main className="w-full p-8 relative min-h-[60vh]">
        <div className="flex flex-col gap-6 items-center justify-center min-h-[60vh]">
          <Spinner size="large" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">Verifying your payment...</p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Attempt {retryCount} of {maxRetries}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Get current payment configuration
  const config = paymentConfig[paymentStatus] || paymentConfig.UNKNOWN;
  const IconComponent = config.icon;

  return (
    <main className="w-full p-4 sm:p-8 relative min-h-[60vh]">
      <div className={`flex flex-col gap-6 items-center justify-center sm:w-3/4 md:w-2/3 lg:w-1/2 m-auto bg-white rounded-xl p-6 sm:p-8 min-h-[60vh] shadow-lg border ${config.borderColor}`}>
        
        {/* Status Icon and Title */}
        <div className="text-center">
          <div className={`mx-auto mb-4 ${config.iconColor}`}>
            <IconComponent sx={{ fontSize: 64 }} />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${config.titleColor} mb-3`}>
            {config.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            {config.subtitle}
          </p>
        </div>

        {/* Order Summary for Successful Payments */}
        {renderOrderSummary()}

        {/* Timer Display */}
        {config.showTimer && (
          <div className="text-center">
            <p className="text-gray-500 mb-2">
              {config.autoRedirect 
                ? `Redirecting in ${time} seconds...`
                : "You will be redirected shortly..."
              }
            </p>
            {config.autoRedirect && (
              <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(time / 15) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/*------------- Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-md">
          {/* Primary Actions */}
          {paymentStatus === "PAID" && (
            <>
              <Link
                to="/user/orders"
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200 text-center"
              >
                View My Orders
              </Link>
              <button
                onClick={() => handleRedirect("/")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200"
              >
                Continue Shopping
              </button>
            </>
          )}

          {paymentStatus === "PENDING" && (
            <>
              <Link
                to="/user/orders"
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200 text-center"
              >
                Check Order Status
              </Link>
              <button
                onClick={handleRetryVerification}
                disabled={retryCount >= maxRetries}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Refresh Status
              </button>
            </>
          )}

          {(paymentStatus === "FAILED" || paymentStatus === "CANCELLED") && (
            <>
              <button
                onClick={handleRetryPayment}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200"
              >
                Try Payment Again
              </button>
              <button
                onClick={() => handleRedirect("/cart")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200"
              >
                Back to Cart
              </button>
              <button
                onClick={() => handleRedirect("/")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200"
              >
                Continue Shopping
              </button>
            </>
          )}

          {paymentStatus === "UNKNOWN" && (
            <>
              <button
                onClick={handleRetryVerification}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200"
              >
                Retry Verification
              </button>
              <button
                onClick={() => handleRedirect("/user/orders")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 px-6 text-white font-semibold rounded-lg transition duration-200"
              >
                Check Orders
              </button>
            </>
          )}
        </div>

        {/* Additional Help Text */}
        <div className="text-center text-sm text-gray-500 mt-4">
          {paymentStatus === "PENDING" && (
            <p>
              If you've completed the payment, it may take a few minutes to reflect.
              <br />
              You can check your orders page for updates.
            </p>
          )}
          {paymentStatus === "FAILED" && (
            <p>
              Having trouble? Contact support at{" "}
              <a href="mailto:support@flipclone.com" className="text-blue-600 hover:underline">
                support@flipclone.com
              </a>
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;


// import { useEffect, useRef, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import axios from "axios";
// import Spinner from "../../../components/Spinner";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";

// const OrderSuccess = () => {
//   const auth = useSelector((s) => s.auth);
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const order_id = searchParams.get("order_id");

//   const [time, setTime] = useState(15);
//   const [paymentStatus, setPaymentStatus] = useState("Pending");
//   const [loading, setLoading] = useState(true);
//   const [verificationComplete, setVerificationComplete] = useState(false);

//   // Verify payment status
//   useEffect(() => {
//     const verifyPayment = async () => {
//       if (!order_id || verificationComplete) return;

//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/api/v1/order/status/${order_id}`,
//           {
//             headers: { Authorization: `Bearer ${auth.token}` },
//           }
//         );

//         console.log("Payment verification response:", res.data);

//         // Fixed condition - check for success response
//         if (res.data.success && res.data.data) {
//           const paymentStatus = res.data.data.paymentStatus;
//           setPaymentStatus(paymentStatus);

//           if (paymentStatus === "PAID") {
//             toast.success("Your order has been confirmed! 🚀✅");
//           } else if (paymentStatus === "PENDING") {
//             toast.info("Your payment is still processing...");
//           } else if (paymentStatus === "FAILED") {
//             toast.error("Payment failed. Please try again.");
//           }
//         } else {
//           toast.error("Failed to verify payment status");
//         }
//       } catch (error) {
//         console.error("Payment verification error:", error);
//         toast.error(
//           error.response?.data?.message || "Failed to verify payment"
//         );
//       } finally {
//         setLoading(false);
//         setVerificationComplete(true);
//       }
//     };

//     verifyPayment();
//   }, [order_id, auth?.token, verificationComplete]);

//   // Timer to redirect after verification
//   const intervalId = useRef(null);
//   useEffect(() => {
//     // Only start timer when verification is complete and not loading
//     if (!loading && verificationComplete) {
//       intervalId.current = setInterval(() => {
//         setTime((prev) => {
//           if (prev <= 1) {
//             clearInterval(intervalId.current);
//             navigate("/user/orders");
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//     };
//   }, [loading, verificationComplete, navigate]);

//   // Show different UI based on payment status
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
//           {/* <Spinner /> */}
//           <p className="text-lg text-gray-600">Verifying your payment...</p>
//         </div>
//       );
//     }

//     if (paymentStatus === "PAID") {
//       return (
//         <div className="flex flex-col gap-4 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-8 min-h-[60vh]">
//           <div className="flex gap-3 items-center">
//             <CheckCircleOutlineIcon className="text-green-500 text-4xl" />
//             <h1 className="text-2xl font-semibold text-green-700">
//               Payment Successful!
//             </h1>
//           </div>
//           <p className="text-lg text-gray-700 text-center">
//             Thank you for your purchase! Your order has been confirmed.
//           </p>
//           <p className="text-gray-600">
//             Redirecting to orders in {time} seconds...
//           </p>
//           <div className="flex gap-4 mt-4">
//             <Link
//               to="/user/orders"
//               className="bg-blue-500 hover:bg-blue-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
//             >
//               View Orders
//             </Link>
//             <Link
//               to="/"
//               className="bg-gray-500 hover:bg-gray-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       );
//     }

//     if (paymentStatus === "PENDING") {
//       return (
//         <div className="flex flex-col gap-4 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-8 min-h-[60vh]">
//           <div className="flex gap-3 items-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//             <h1 className="text-2xl font-semibold text-blue-700">
//               Payment Processing
//             </h1>
//           </div>
//           <p className="text-lg text-gray-700 text-center">
//             Your payment is being processed. This may take a few moments.
//           </p>
//           <p className="text-gray-600">
//             Redirecting to orders in {time} seconds...
//           </p>
//           <Link
//             to="/user/orders"
//             className="bg-blue-500 hover:bg-blue-600 py-2.5 px-6 text-white uppercase rounded transition duration-200 mt-4"
//           >
//             Check Order Status
//           </Link>
//         </div>
//       );
//     }

//     // FAILED or other status
//     return (
//       <div className="flex flex-col gap-4 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-8 min-h-[60vh]">
//         <div className="flex gap-3 items-center">
//           <div className="text-red-500 text-4xl">⚠️</div>
//           <h1 className="text-2xl font-semibold text-red-700">
//             Payment Failed
//           </h1>
//         </div>
//         <p className="text-lg text-gray-700 text-center">
//           Unfortunately, your payment was not successful. Please try again.
//         </p>
//         <div className="flex gap-4 mt-4">
//           <button
//             onClick={() => navigate("/cart")}
//             className="bg-red-500 hover:bg-red-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
//           >
//             Try Again
//           </button>
//           <Link
//             to="/"
//             className="bg-gray-500 hover:bg-gray-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <main className="w-full p-8 relative min-h-[60vh]">{renderContent()}</main>
//   );
// };

// export default OrderSuccess;

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";
import Spinner from "./../../../components/Spinner";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const OrderSuccess = () => {
  const auth = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get("order_id");

  const [time, setTime] = useState(15);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Verify payment status
  useEffect(() => {
    const verifyPayment = async () => {
      if (!order_id || verificationComplete) return;

      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/order/status/${order_id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );

        console.log("Payment verification response:", res.data);

        // Fixed condition - check for success response
        if (res.data.success && res.data.data) {
          const paymentStatus = res.data.data.paymentStatus;
          setPaymentStatus(paymentStatus);

          if (paymentStatus === "PAID") {
            toast.success("Your order has been confirmed! 🚀✅");
          } else if (paymentStatus === "PENDING") {
            toast.info("Your payment is still processing...");
          } else if (paymentStatus === "FAILED") {
            toast.error("Payment failed. Please try again.");
          }
        } else {
          toast.error("Failed to verify payment status");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error(
          error.response?.data?.message || "Failed to verify payment"
        );
      } finally {
        setLoading(false);
        setVerificationComplete(true);
      }
    };

    verifyPayment();
  }, [order_id, auth?.token, verificationComplete]);

  // Timer to redirect after verification
  const intervalId = useRef(null);
  useEffect(() => {
    // Only start timer when verification is complete and not loading
    if (!loading && verificationComplete) {
      intervalId.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId.current);
            navigate("/user/orders");
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
  }, [loading, verificationComplete, navigate]);

  // Show different UI based on payment status
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
          {/* <Spinner /> */}
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </div>
      );
    }

    if (paymentStatus === "PAID") {
      return (
        <div className="flex flex-col gap-4 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-8 min-h-[60vh]">
          <div className="flex gap-3 items-center">
            <CheckCircleOutlineIcon className="text-green-500 text-4xl" />
            <h1 className="text-2xl font-semibold text-green-700">
              Payment Successful!
            </h1>
          </div>
          <p className="text-lg text-gray-700 text-center">
            Thank you for your purchase! Your order has been confirmed.
          </p>
          <p className="text-gray-600">
            Redirecting to orders in {time} seconds...
          </p>
          <div className="flex gap-4 mt-4">
            <Link
              to="/user/orders"
              className="bg-blue-500 hover:bg-blue-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
            >
              View Orders
            </Link>
            <Link
              to="/"
              className="bg-gray-500 hover:bg-gray-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }

    if (paymentStatus === "PENDING") {
      return (
        <div className="flex flex-col gap-4 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-8 min-h-[60vh]">
          <div className="flex gap-3 items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <h1 className="text-2xl font-semibold text-blue-700">
              Payment Processing
            </h1>
          </div>
          <p className="text-lg text-gray-700 text-center">
            Your payment is being processed. This may take a few moments.
          </p>
          <p className="text-gray-600">
            Redirecting to orders in {time} seconds...
          </p>
          <Link
            to="/user/orders"
            className="bg-blue-500 hover:bg-blue-600 py-2.5 px-6 text-white uppercase rounded transition duration-200 mt-4"
          >
            Check Order Status
          </Link>
        </div>
      );
    }

    // FAILED or other status
    return (
      <div className="flex flex-col gap-4 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-8 min-h-[60vh]">
        <div className="flex gap-3 items-center">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h1 className="text-2xl font-semibold text-red-700">
            Payment Failed
          </h1>
        </div>
        <p className="text-lg text-gray-700 text-center">
          Unfortunately, your payment was not successful. Please try again.
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate("/cart")}
            className="bg-red-500 hover:bg-red-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="bg-gray-500 hover:bg-gray-600 py-2.5 px-6 text-white uppercase rounded transition duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  };

  return (
    <main className="w-full p-8 relative min-h-[60vh]">{renderContent()}</main>
  );
};

export default OrderSuccess;

// import { useEffect, useRef, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import axios from "axios";
// import Spinner from "./../../../components/Spinner";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";

// const OrderSuccess = () => {
//     const auth = useSelector(s => s.auth);
//     const {cartItem } = useSelector(s => s.cart);
//     const navigate = useNavigate();
//     const [ searchParams ] = useSearchParams();
//     const order_id = searchParams.get("order_id")

//   const [time, setTime] = useState(10);
//   const [paymentStatus, setPaymentStatus] = useState("Pending")
//   const [loading, setLoading] = useState(true);
//   const [hasSavedPayment, setHasSavedPayment] = useState(false); // Add a flag to prevent multiple API calls

//   // After order placement, remove items from cart and save details to the database
//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/api/v1/order/status/${order_id}`,
//           {headers: { Authorization: `Bearer ${auth.token}` },}
//         );
//         let data = res.data.data;
//         console.log(res)
//         if (res.data.status === 200 && res.data.success === true ) {
//             data.paymentStatus === "PAID" &&
//             setPaymentStatus(data.paymentStatus) &&
//             toast.success(`Your status order Confirmed!! 🚀🚀✅`)
//             setLoading(false);
//             setHasSavedPayment(true); // Mark the payment as saved to prevent further API calls
//         }
//       } catch (error) {
//         toast.error(error.message)
//         console.log(error);
//       }
//     };

//     // if (sessionId && cartItem.length > 0 && !hasSavedPayment) {
//     if (order_id && !hasSavedPayment) {
//         verifyPayment(); // Ensure the API call is only triggered once
//     }
//   }, [order_id, auth?.token, cartItem, hasSavedPayment]);

//   //? Timer to redirect after 3 sec
//   let intervalId = useRef(null);
//   useEffect(() => {
//     intervalId.current = setInterval(() => {
//       if (!loading)
//         setTime((prev) => {
//           let temp = prev - 1;
//           if (temp === 0) {
//             clearInterval(intervalId.current);
//             navigate("/user/orders");
//           }
//           return temp;
//         });
//     }, 1000);
//     return () => clearInterval(intervalId.current);
//   }, [loading, navigate]);

//   return (
//     <>
//       <main className="w-full p-8 relative min-h-[60vh]">
//         {!loading ? (
//           <Spinner />
//         ) : (
//           <div className="flex flex-col gap-2 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-6 min-h-[60vh]">
//             <div className="flex gap-4 items-center">
//               <h1 className="text-2xl font-semibold">Transaction Successful</h1>
//               <CheckCircleOutlineIcon className="text-blue-500" />
//             </div>
//             <p className="mt-4 text-lg text-gray-800">
//               Redirecting to orders in {time} sec
//             </p>
//             <Link
//               to="/user/orders"
//               className="bg-blue-500 mt-2 py-2.5 px-6 text-white uppercase shadow hover:shadow-lg rounded-sm"
//             >
//               go to orders
//             </Link>
//           </div>
//         )}
//       </main>
//     </>
//   );
// };

// export default OrderSuccess;

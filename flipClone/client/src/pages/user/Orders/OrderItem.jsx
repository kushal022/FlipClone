import CircleIcon from "@mui/icons-material/Circle";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/functions";

const OrderItem = ({
  item,
  orderId,
  orderStatus,
  createdAt,
  paymentInfo,
  buyer,
  shippingAddress,
  itemsPrice,
  showFullDetails = true, // New prop to control detail level
}) => {
  // Status configuration for consistent styling and messaging
  const statusConfig = {
    Confirmed: {
      color: "text-blue-500",
      muiColor: 'blue',
      icon: "🔵",
      message: "Your order has been confirmed",
      shortMessage: "Order confirmed",
    },
    Processing: {
      color: "text-purple-500",
      muiColor: 'purple',
      icon: "🟣",
      message: "Seller has processed your order",
      shortMessage: "Processing",
    },
    Shipped: {
      color: "text-orange-500",
      muiColor: 'orange',
      icon: "🟠",
      message: "Your item has been shipped",
      shortMessage: "Shipped",
    },
    "Out For Delivery": {
      color: "text-yellow-500",
      muiColor: 'yellow',
      icon: "🟡",
      message: "Your order is out for delivery",
      shortMessage: "Out for delivery",
    },
    Delivered: {
      color: "text-green-500",
      muiColor: 'green',
      icon: "🟢",
      message: "Your item has been delivered",
      shortMessage: "Delivered",
    },
    Cancelled: {
      color: "text-red-500",
      muiColor: 'red',
      icon: "🔴",
      message: "Your order has been cancelled",
      shortMessage: "Cancelled",
    },
    Returned: {
      color: "text-gray-500",
      muiColor: 'gray',
      icon: "⚫",
      message: "Your order has been returned",
      shortMessage: "Returned",
    },
  };

  const currentStatus = statusConfig[orderStatus] || statusConfig["Confirmed"];

  // Calculate total price for this specific item
  const itemTotalPrice = (item?.discountPrice || item?.price) * item?.quantity;
  console.log(orderStatus)
  return (
    <Link
      to={`/user/orders/order_details/${orderId}`}
      className="flex flex-col sm:flex-row items-start bg-white border border-gray-300 rounded-lg gap-5 px-4 sm:px-6 py-4 hover:shadow-lg transition-shadow duration-200 mx-2 sm:mx-4 mb-4"
    >
      {/* Product Image */}
      <div className="w-full sm:w-28 h-20 flex-shrink-0">
        <img
          draggable="false"
          className="h-full w-full object-contain rounded-lg"
          src={item?.image}
          alt={item?.name}
          onError={(e) => {
            e.target.src = "/images/placeholder-product.png"; // Fallback image
          }}
        />
      </div>

      {/* Order Details */}
      <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
        {/* Product Information */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {item?.name}
          </h3>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
            <span>Quantity: {item?.quantity}</span>
            <span>Size: {item?.size || "Standard"}</span>
            {item?.color && <span>Color: {item?.color}</span>}
          </div>

          {/* Price Information */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              ₹{itemTotalPrice.toLocaleString()}
            </span>
            {item?.price > item?.discountPrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{(item?.price * item?.quantity).toLocaleString()}
              </span>
            )}
          </div>

          {/* Additional Details - Conditionally Rendered */}
          {showFullDetails && (
            <div className="mt-2 text-xs text-gray-600">
              <p>Order ID: {orderId}</p>
              <p>Order Date: {formatDate(createdAt)}</p>
              {buyer && <p>Buyer: {buyer.fname + " " + buyer.lname}</p>}
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="flex flex-col gap-2 sm:w-48 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CircleIcon
              sx={{
                fontSize: "12px",
                // color: currentStatus.color.replace("text-", ""),
                color: currentStatus.muiColor,
              }}
            />
            <span className={`text-sm font-medium ${currentStatus.color}`}>
              {orderStatus}
            </span>
          </div>

          <p className="text-xs text-gray-600 ml-1">{currentStatus.message}</p>

          {/* Delivery Estimate */}
          {(orderStatus === "Shipped" ||
            orderStatus === "Out For Delivery") && (
            <p className="text-xs text-blue-600 font-medium">
              Expected delivery:{" "}
              {formatDate(
                new Date(createdAt).setDate(new Date(createdAt).getDate() + 7)
              )}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-1">
            {orderStatus === "Delivered" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  //? Handle return/replace
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Return/Replace
              </button>
            )}

            {orderStatus === "Shipped" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  //? Track package
                }}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Track Package
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Default props for better error handling
OrderItem.defaultProps = {
  item: {
    name: "Product Name",
    image: "",
    quantity: 1,
    discountPrice: 0,
    price: 0,
  },
  orderStatus: "Confirmed",
  createdAt: new Date().toISOString(),
};

export default OrderItem;




// import CircleIcon from "@mui/icons-material/Circle";
// import { Link } from "react-router-dom";
// import { formatDate } from "../../../utils/functions";

// const OrderItem = ({
//   item,
//   orderId,
//   orderStatus,
//   createdAt,
//   paymentInfo,
//   buyer,
//   shippingAddress,
//   itemsPrice,
// }) => {
//   return (
//     <Link
//       to={`/order_details/${orderId}`}
//       className="flex flex-col sm:flex-row items-start bg-white border rounded gap-5 px-4 sm:px-8 py-5 hover:shadow-lg mx-2 sm:mx-10"
//     >
//       {/* <!-- image container --> */}
//       <div className="w-full sm:w-32 h-20">
//         <img
//           draggable="false"
//           className="h-full w-full object-contain"
//           src={item?.image}
//           alt={item?.name}
//         />
//       </div>
//       {/* <!-- image container --> */}

//       {/* <!-- order desc container --> */}
//       <div className="flex flex-col sm:flex-row justify-between w-full">
//         <div className="flex flex-col w-[300px] gap-1 overflow-hidden">
//           <p className="text-sm">
//             {item?.name.length > 40
//               ? `${item?.name.substring(0, 40)}...`
//               : item?.name}
//           </p>
//           <p className="text-xs text-gray-500 mt-1">
//             Quantity: {item?.quantity}
//           </p>
//         </div>

//         <div className="flex flex-col sm:flex-row mt-1 sm:mt-0 gap-2 sm:gap-20 sm:w-1/2">
//           <p className="text-sm w-[100px]">
//             ₹{item?.discountPrice.toLocaleString()}
//           </p>

//           <div className="flex flex-col gap-2">
//             <p className="text-sm font-medium flex items-center gap-1 w-[250px]">
//               {orderStatus === "Shipped" ? (
//                 <>
//                   <span className="text-orange-500 pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Shipped
//                 </>
//               ) : orderStatus === "Delivered" ? (
//                 <>
//                   <span className="text-green-500 pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Delivered
//                 </>
//               ) : orderStatus === "Out For Delivery" ? (
//                 <>
//                   <span className="text-yellow-500 pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Out For Delivery
//                 </>
//               ) : (
//                 <>
//                   <span className="text-blue-500 pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Ordered on {formatDate(createdAt)}
//                 </>
//               )}
//             </p>
//             {orderStatus === "Delivered" ? (
//               <p className="text-xs ml-1">Your item has been Delivered</p>
//             ) : orderStatus === "Shipped" ? (
//               <p className="text-xs ml-1">Your item has been Shipped</p>
//             ) : orderStatus === "Processing" ? (
//               <p className="text-xs ml-1">Seller has processed your order</p>
//             ) : orderStatus === "Out For Delivery" ? (
//               <p className="text-xs ml-1">Your order is Out for Delivery</p>
//             ) : (
//               <p className="text-xs ml-1">Your order has been placed</p>
//             )}
//           </div>
//         </div>
//       </div>
//       {/* <!-- order desc container --> */}
//     </Link>
//   );
// };

// export default OrderItem;

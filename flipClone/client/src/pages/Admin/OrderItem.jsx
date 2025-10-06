import CircleIcon from "@mui/icons-material/Circle";
import { Link } from "react-router-dom";
import { formatDate, formatDateTime } from "../../utils/functions";

const OrderItem = ({
  item,
  orderId,
  orderStatus,
  createdAt,
  paymentInfo,
  buyer,
  shippingAddress,
  totalPrice,
  orderItemsPrice,
  shippingPrice,
  isPaid,
  paymentStatus,
  orderIndex,
  itemIndex,
  totalItems,
}) => {
  // Status configuration
  const statusConfig = {
    Pending: {
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      message: "Order received and pending confirmation"
    },
    Confirmed: {
      color: "text-blue-500", 
      bgColor: "bg-blue-50",
      message: "Order confirmed and processing"
    },
    Processing: {
      color: "text-purple-500",
      bgColor: "bg-purple-50", 
      message: "Order is being processed"
    },
    Shipped: {
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      message: "Product has been shipped"
    },
    "Out For Delivery": {
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      message: "Product is out for delivery"
    },
    Delivered: {
      color: "text-green-500",
      bgColor: "bg-green-50",
      message: "Product successfully delivered"
    },
    Cancelled: {
      color: "text-red-500",
      bgColor: "bg-red-50",
      message: "Order has been cancelled"
    },
    Returned: {
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      message: "Product has been returned"
    }
  };

  const currentStatus = statusConfig[orderStatus] || statusConfig.Pending;

  return (
    <div className={`flex flex-col sm:flex-row items-start border rounded-lg gap-5 px-4 sm:px-6 py-4 transition-all duration-200 mx-2 sm:mx-4 ${currentStatus.bgColor}`}>
      {/* Product Image */}
      <div className="w-full sm:w-28 h-20 flex-shrink-0">
        <img
          draggable="false"
          className="h-full w-full object-contain rounded-lg"
          src={item?.image}
          alt={item?.name}
          onError={(e) => {
            e.target.src = '/images/placeholder-product.png';
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
            <span>Brand: {item?.brandName}</span>
            {item?.seller?.fname && (
              <span>Seller: {item.seller.fname} {item.seller.lname}</span>
            )}
          </div>

          {/* Price Information */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              ₹{(item?.discountPrice * item?.quantity).toLocaleString()}
            </span>
            {item?.price > item?.discountPrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{(item?.price * item?.quantity).toLocaleString()}
              </span>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <p>Order Date: {formatDateTime(createdAt)}</p>
            <p>Payment: <span className={`font-medium ${
              paymentStatus === "PAID" ? "text-green-600" : 
              paymentStatus === "PENDING" ? "text-yellow-600" : "text-red-600"
            }`}>
              {paymentStatus}
            </span></p>
          </div>
        </div>

        {/* Order Status */}
        <div className="flex flex-col gap-2 sm:w-48 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CircleIcon sx={{ fontSize: "12px", color: currentStatus.color.replace('text-', '') }} />
            <span className={`text-sm font-medium ${currentStatus.color}`}>
              {orderStatus}
            </span>
          </div>

          <p className="text-xs text-gray-600 ml-1">
            {currentStatus.message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-1">
            <Link
              to={`/admin/orders/order_details/${orderId}`}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium text-center py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex-1"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;


// import CircleIcon from "@mui/icons-material/Circle";
// import { Link } from "react-router-dom";
// import { formatDate, formatDateTime } from "../../utils/functions";

// const OrderItem = ({
//   item,
//   orderId,
//   orderStatus,
//   createdAt,
//   paymentInfo,
//   buyer,
//   shippingAddress,
//   totalPrice,
//   orderItemsPrice,
//   shippingPrice,
//   isPaid,
//   paymentStatus,
// }) => {
//   console.log(item)
//   return (
//     <Link
//       to={`./order_details/${orderId}`}
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
//                   <span className="text-orange pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Shipped
//                 </>
//               ) : orderStatus === "Delivered" ? (
//                 <>
//                   <span className="text-primaryGreen pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Delivered
//                 </>
//               ) : orderStatus === "Out For Delivery" ? (
//                 <>
//                   <span className="text-primaryGreen pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Out For Delivery
//                 </>
//               ) : (
//                 <>
//                   <span className="text-primaryBlue pb-0.5">
//                     <CircleIcon sx={{ fontSize: "14px" }} />
//                   </span>
//                   Order received on {formatDateTime(createdAt)}
//                 </>
//               )}
//             </p>
//             {orderStatus === "Delivered" ? (
//               <p className="text-xs ml-1">Item successfully delivered</p>
//             ) : orderStatus === "Out For Delivery" ? (
//               <p className="text-xs ml-1">Product is out for delivery</p>
//             ) : orderStatus === "Shipped" ? (
//               <p className="text-xs ml-1">You have processed this order</p>
//             ) : (
//               <p className="text-xs ml-1">Order received</p>
//             )}
//           </div>
//         </div>
//       </div>
//       {/* <!-- order desc container --> */}
//     </Link>
//   );
// };

// export default OrderItem;

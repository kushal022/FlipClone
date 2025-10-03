import CircleIcon from "@mui/icons-material/Circle";
import { Link } from "react-router-dom";
import { formatDateTime } from "../../../utils/functions";

const OrderItem = ({
  item,
  totalItems,
  itemIndex,
  orderIndex,
  orderId,
  orderStatus,
  createdAt,
  paymentInfo,
  buyer,
  shippingAddress,
  itemsPrice,
  showFullDetails = true,
  paymentStatus, // Add payment status prop
  totalPrice, // Add total order price
}) => {
  // Enhanced status configuration
  const statusConfig = {
    Pending: {
      color: "text-yellow-500",
      muiColor: 'yellow',
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      icon: "🟡",
      message: "Your order is being processed",
      shortMessage: "Pending",
    },
    Confirmed: {
      color: "text-blue-500",
      muiColor: 'blue',
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: "🔵",
      message: "Your order has been confirmed",
      shortMessage: "Confirmed",
    },
    Processing: {
      color: "text-purple-500",
      muiColor: 'purple',
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: "🟣",
      message: "Seller has processed your order",
      shortMessage: "Processing",
    },
    Shipped: {
      color: "text-orange-500",
      muiColor: 'orange',
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      icon: "🟠",
      message: "Your item has been shipped",
      shortMessage: "Shipped",
    },
    "Out For Delivery": {
      color: "text-yellow-600",
      muiColor: 'orange',
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: "🚚",
      message: "Your order is out for delivery",
      shortMessage: "Out for delivery",
    },
    Delivered: {
      color: "text-green-500",
      muiColor: 'green',
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: "🟢",
      message: "Your item has been delivered",
      shortMessage: "Delivered",
    },
    Cancelled: {
      color: "text-red-500",
      muiColor: 'red',
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: "🔴",
      message: "Your order has been cancelled",
      shortMessage: "Cancelled",
    },
    Returned: {
      color: "text-gray-500",
      muiColor: 'gray',
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: "↩️",
      message: "Your order has been returned",
      shortMessage: "Returned",
    },
  };

  const currentStatus = statusConfig[orderStatus] || statusConfig["Pending"];

  // Calculate total price for this specific item
  const itemTotalPrice = (item?.discountPrice || item?.price) * item?.quantity;
  
  // Calculate savings
  const savings = item?.price > item?.discountPrice 
    ? (item?.price - item?.discountPrice) * item?.quantity 
    : 0;

  // Format payment status
  const getPaymentStatus = () => {
    if (!paymentStatus) return null;
    
    const paymentConfig = {
      PAID: { color: "text-green-600", bg: "bg-green-100", text: "Paid" },
      PENDING: { color: "text-yellow-600", bg: "bg-yellow-100", text: "Pending" },
      FAILED: { color: "text-red-600", bg: "bg-red-100", text: "Failed" },
    };
    
    return paymentConfig[paymentStatus] || paymentConfig.PENDING;
  };

  const paymentStatusInfo = getPaymentStatus();

  return (
    <div className={`flex flex-col sm:flex-row items-start border rounded-lg gap-5 px-4 sm:px-6 py-4 transition-all duration-200 mx-2 sm:mx-4 mb-4 
      ${currentStatus.bgColor} ${currentStatus.borderColor} hover:shadow-md hover:scale-[1.002] relative`}
    >
      {/* Item Counter Badge */}
      {totalItems > 1 && (
        <div className="absolute top-2 left-2 bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
          {orderIndex + 1}
        </div>
      )}

      {/* Product Image */}
      <div className="w-full sm:w-28 h-20 flex-shrink-0 relative">
        <img
          draggable="false"
          className="h-full w-full object-contain rounded-lg"
          src={item?.image}
          alt={item?.name}
          onError={(e) => {
            e.target.src = "/images/placeholder-product.png";
          }}
        />
        
        {/* Quantity Badge */}
        {item?.quantity > 1 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {item.quantity}
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="flex flex-col sm:flex-row justify-between w-full gap-4 flex-1">
        {/* Product Information */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
              {item?.name}
            </h3>
            
            {/* Payment Status Badge */}
            {paymentStatusInfo && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.bg} ${paymentStatusInfo.color} whitespace-nowrap`}>
                {paymentStatusInfo.text}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <span className="font-medium">Qty:</span> 
              {item?.quantity}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Size:</span> 
              {item?.size || "Standard"}
            </span>
            {item?.color && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Color:</span> 
                {item?.color}
              </span>
            )}
          </div>

          {/* Price Information */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                ₹{itemTotalPrice.toLocaleString()}
              </span>
              
              {item?.price > item?.discountPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{(item?.price * item?.quantity).toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Savings Badge */}
            {savings > 0 && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block">
                You saved ₹{savings.toLocaleString()}
              </span>
            )}
          </div>

          {/* Additional Details - Conditionally Rendered */}
          {showFullDetails && (
            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <span className="font-medium">Order ID:</span> 
                <span className="font-mono">{orderId}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Order Date:</span> 
                {formatDateTime(createdAt)}
              </p>
              {buyer && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Buyer:</span> 
                  {buyer.fname + " " + buyer.lname}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Status & Actions */}
        <div className="flex flex-col gap-3 sm:w-48 flex-shrink-0">
          {/* Status Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CircleIcon
                sx={{
                  fontSize: "12px",
                  color: currentStatus.muiColor,
                }}
              />
              <span className={`text-sm font-semibold ${currentStatus.color}`}>
                {orderStatus}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {currentStatus.message}
            </p>

            {/* Delivery Estimate */}
            {(orderStatus === "Shipped" || orderStatus === "Out For Delivery") && (
              <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                Expected: {formatDateTime(new Date(createdAt).setDate(new Date(createdAt).getDate() + 7))}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/user/orders/order_details/${orderId}`}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium text-center py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              View Details
            </Link>

            <div className="flex gap-3 justify-center">
              {orderStatus === "Delivered" && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    //? Handle return/replace
                    console.log("Initiate return for:", orderId, item?._id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Return
                </button>
              )}

              {orderStatus === "Shipped" && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    //? Track package
                    console.log("Track package for:", orderId);
                  }}
                  className="text-xs text-green-600 hover:text-green-800 font-medium"
                >
                  Track
                </button>
              )}

              {(orderStatus === "Delivered" || orderStatus === "Shipped") && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    //? Buy again
                    console.log("Buy again:", item?.productId);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Buy Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  orderStatus: "Pending",
  createdAt: new Date().toISOString(),
  paymentStatus: "PENDING",
};

export default OrderItem;
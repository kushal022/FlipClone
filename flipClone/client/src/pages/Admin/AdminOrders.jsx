import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderItem from "./OrderItem";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import Spinner from "../../components/Spinner";
import axios from "axios";
import { useSelector } from "react-redux";

const AdminOrders = () => {
  const auth = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    dateRange: "",
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch orders from server with filters and pagination
  const fetchOrders = useCallback(
    async (page = 1, filters = {}) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...filters,
        });

        if (search) {
          params.append("search", search);
        }

        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/order/admin-orders?${params}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        const responseData = res.data.data;

        if (responseData) {
          setOrders(responseData.orders || []);
          setPagination(responseData.pagination || {});
          setStats(responseData.stats || {});
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    },
    [auth?.token, search]
  );

  // Initial fetch
  useEffect(() => {
    fetchOrders(1, filters);
  }, [fetchOrders, filters]);

  // Refresh when coming back from update
  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrders(1, filters);
      // Clear the state to prevent re-fetch on other navigations
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refresh, fetchOrders, filters, navigate, location.pathname]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, filters);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      dateRange: "",
    });
    setSearch("");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, filters);
    }
  };

  // Refresh orders
  const handleRefresh = () => {
    fetchOrders(currentPage, filters);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Processing: "bg-purple-100 text-purple-800",
      Shipped: "bg-orange-100 text-orange-800",
      "Out For Delivery": "bg-indigo-100 text-indigo-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Returned: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <main className="w-full px-4 sm:px-6 py-4">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Seller Orders</h1>
          <p className="text-gray-600">Manage and track your product orders</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalOrders || 0}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              ₹{(stats.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingOrders || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">
              {stats.confirmedOrders || 0}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-lg shadow border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex items-center border border-gray-300 rounded-lg hover:shadow-md transition-shadow">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="search"
                  name="search"
                  placeholder="Search by order ID, product name..."
                  className="p-3 text-sm outline-none flex-1 rounded-l-lg"
                />
                <button
                  type="submit"
                  className="h-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-r-lg flex items-center gap-2 transition-colors"
                >
                  <SearchIcon sx={{ fontSize: "20px" }} />
                  <span className="text-sm font-medium hidden sm:block">
                    Search
                  </span>
                </button>
              </div>
            </form>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FilterListIcon sx={{ fontSize: 20 }} />
                <span className="text-sm font-medium">Filters</span>
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshIcon sx={{ fontSize: 20 }} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    handleFilterChange("paymentStatus", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Payment Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>

                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear all filters
                </button>
                <span className="text-sm text-gray-500">
                  {pagination.totalOrders || 0} orders found
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="flex gap-3.5 w-full">
          {loading ? (
            <div className="flex justify-center items-center w-full py-20">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full pb-5">
              {orders.length === 0 ? (
                <div className="flex items-center flex-col gap-4 p-12 bg-white rounded-lg shadow border">
                  <img
                    draggable="false"
                    src="https://rukminim1.flixcart.com/www/100/100/promos/23/08/2020/c5f14d2a-2431-4a36-b6cb-8b5b5e283d4f.png"
                    alt="Empty Orders"
                    className="w-32 h-32 opacity-70"
                  />
                  <div className="text-center">
                    <span className="text-xl font-semibold text-gray-700">
                      No orders found
                    </span>
                    <p className="text-gray-500 mt-2">
                      {search || Object.values(filters).some(Boolean)
                        ? "Try adjusting your search or filters"
                        : "You haven't received any orders yet"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Orders Count */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm text-gray-600">
                      Showing {orders.length} of {pagination.totalOrders || 0}{" "}
                      orders
                      {search && ` for "${search}"`}
                    </span>
                  </div>

                  {/* Orders Items */}
                  {orders.map((order, orderIndex) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow border overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="border-b bg-gray-50 px-6 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-900">
                              Order #{order.cashfreeOrderId}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Buyer:</span>
                            <span className="font-medium">
                              {order.buyer?.fname} {order.buyer?.lname}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="font-semibold text-gray-900">
                              ₹
                              {order.sellerStats?.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="divide-y">
                        {order.orderItems?.map((item, itemIndex) => (
                          <OrderItem
                            item={item}
                            key={`${order._id}-${itemIndex}`}
                            orderId={order._id}
                            orderStatus={order.orderStatus}
                            createdAt={order.createdAt}
                            paymentInfo={order.paymentInfo}
                            buyer={order.buyer}
                            shippingAddress={order.shippingAddress}
                            totalPrice={order.totalPrice}
                            orderItemsPrice={order.itemsPrice}
                            shippingPrice={order.shippingPrice}
                            isPaid={order.isPaid}
                            paymentStatus={order.paymentStatus}
                            orderIndex={orderIndex}
                            itemIndex={itemIndex}
                            totalItems={order.orderItems?.length}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-6 py-4 bg-white rounded-lg shadow border">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {pagination.totalPages}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.hasPrev}
                          className={`px-3 py-2 rounded border text-sm font-medium ${
                            pagination.hasPrev
                              ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          Previous
                        </button>

                        <span className="px-3 py-2 text-sm text-gray-600">
                          {currentPage} / {pagination.totalPages}
                        </span>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasNext}
                          className={`px-3 py-2 rounded border text-sm font-medium ${
                            pagination.hasNext
                              ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminOrders;



// import { useEffect, useState } from "react";
// import OrderItem from "./OrderItem";
// import SearchIcon from "@mui/icons-material/Search";
// import Spinner from "../../components/Spinner";
// import axios from "axios";
// import { useSelector } from "react-redux";

// const AdminOrders = () => {
//   const auth  = useSelector(s => s.auth);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [orders, setOrders] = useState([]);

//   //? fetch orders from server
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/api/v1/order/admin-orders`,
//           {
//             headers: {
//               Authorization:`Bearer ${auth?.token}`,
//             },
//           }
//         );
//         let orders = res.data.data;
//         if (orders) {
//           setOrders(orders);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.log(error);
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, [auth?.token]);

//         console.log('orders:----', orders);

//   return (
//     <>
//       <main className="w-full px-4 sm:px-10 py-4 ">
//         {/* <!-- row --> */}
//         {/* <!-- orders column --> */}
//         <div className="flex gap-3.5 w-full ">
//           {loading ? (
//             <Spinner />
//           ) : (
//             <div className="flex flex-col gap-3 w-full pb-5 overflow-hidden">
//               {/* <!-- searchbar --> */}
//               <form
//                 // onSubmit={searchOrders}
//                 className="flex items-center justify-between mx-auto w-[100%] sm:w-10/12 bg-white border rounded mb-2 hover:shadow-md"
//               >
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   type="search"
//                   name="search"
//                   placeholder="Search your orders here"
//                   className="p-2 text-sm outline-none flex-1 rounded-l "
//                 />
//                 <button
//                   type="submit"
//                   className="h-full text-sm px-1 sm:px-4 py-2.5 text-white bg-blue-500 hover:bg-blue-600 rounded-r flex items-center gap-1"
//                 >
//                   <SearchIcon sx={{ fontSize: "20px" }} />
//                   <p className="text-[10px] sm:text-[14px]">Search</p>
//                 </button>
//               </form>
//               {/* <!-- search bar --> */}

//               {orders?.length === 0 && (
//                 <div className="flex items-center flex-col gap-2 p-10 bg-white rounded-sm ">
//                   <img
//                     draggable="false"
//                     src="https://rukminim1.flixcart.com/www/100/100/promos/23/08/2020/c5f14d2a-2431-4a36-b6cb-8b5b5e283d4f.png"
//                     alt="Empty Orders"
//                   />
//                   <span className="text-lg font-medium">
//                     Sorry, no orders found
//                   </span>
//                   <p>Get some orders first</p>
//                 </div>
//               )}

//               {orders && orders
//                 ?.map((order) => {
//                   const {
//                     _id,
//                     orderStatus,
//                     buyer,
//                     createdAt,
//                     paymentInfo,
//                     shippingAddress,
//                     itemsPrice,
//                     totalPrice,
//                     shippingPrice,
//                     paymentStatus,
//                     cashfreeOrderId,
//                     isDelivered,
//                     orderItems,
//                     isPaid,
//                   } = order;
//                   return orderItems.map((item, index) => (
//                     <OrderItem
//                       item={item}
//                       key={index}
//                       orderId={cashfreeOrderId}
//                       orderStatus={orderStatus}
//                       createdAt={createdAt}
//                       paymentInfo={paymentInfo}
//                       buyer={buyer}
//                       shippingAddress={shippingAddress}
//                       totalPrice={totalPrice}
//                       orderItemsPrice={itemsPrice}
//                       shippingPrice={shippingPrice}
//                       isPaid={isPaid}
//                       paymentStatus={paymentStatus}
//                     />
//                   ));
//                 })
//                 .reverse()}
//             </div>
//           )}
//         </div>
//         {/* <!-- orders column --> */}
//         {/* <!-- row --> */}
//       </main>
//     </>
//   );
// };

// export default AdminOrders;

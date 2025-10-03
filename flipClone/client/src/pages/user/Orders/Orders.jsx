import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import OrderItem from "./OrderItem";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import MinCategory from "../../../components/MinCategory";
import Spinner from "../../../components/Spinner";
import axios from "axios";
import { useSelector } from "react-redux";

const Orders = () => {
  const auth = useSelector((s) => s.auth);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    dateRange: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    cancelled: 0,
  });

  // Memoized fetch function
  const fetchOrders = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters,
        });

        if (search) {
          params.append("search", search);
        }

        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/order?${params}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );

        const ordersData = response?.data?.data?.orders;
        const paginationData = response?.data?.data?.pagination;

        if (ordersData) {
          setOrders(ordersData);
          setPagination(paginationData);
          setCurrentPage(page);

          // Calculate order statistics
          calculateOrderStats(ordersData);
        }
      } catch (error) {
        console.log("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    },
    [auth.token, search]
  );

  // Calculate order statistics
  const calculateOrderStats = (orders) => {
    const stats = {
      total: orders.length,
      delivered: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      cancelled: 0,
      confirmed: 0,
    };

    orders.forEach((order) => {
      switch (order.orderStatus) {
        case "Delivered":
          stats.delivered++;
          break;
        case "Pending":
          stats.pending++;
          break;
        case "Processing":
          stats.processing++;
          break;
        case "Shipped":
          stats.shipped++;
          break;
        case "Cancelled":
          stats.cancelled++;
          break;
        case "Confirmed":
          stats.confirmed++;
          break;
        default:
          stats.pending++;
      }
    });

    setOrderStats(stats);
  };

  useEffect(() => {
    fetchOrders(1, limit, filters);
  }, [fetchOrders, limit, filters]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, limit, filters);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, limit, filters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Export orders (placeholder function)
  const handleExportOrders = () => {
    // Implement export functionality
    console.log("Exporting orders...");
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      Delivered: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-orange-100 text-orange-800",
      Cancelled: "bg-red-100 text-red-800",
      Confirmed: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <MinCategory />
      <main className="w-full px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex gap-3.5 w-full">
          {loading && currentPage === 1 ? (
            <div className="flex justify-center items-center w-full py-20">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full pb-5">
              {/* Header Section with Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      My Orders
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage and track your orders
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FilterListIcon sx={{ fontSize: 20 }} />
                      <span className="text-sm font-medium">Filters</span>
                    </button>
                    <button
                      onClick={handleExportOrders}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <DownloadIcon sx={{ fontSize: 20 }} />
                      <span className="text-sm font-medium">Export</span>
                    </button>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {orderStats.total}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Total
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {orderStats.confirmed}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      Confirmed
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {orderStats.processing}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Processing
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {orderStats.shipped}
                    </div>
                    <div className="text-sm text-orange-600 font-medium">
                      Shipped
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {orderStats.delivered}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Delivered
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {orderStats.pending}
                    </div>
                    <div className="text-sm text-yellow-600 font-medium">
                      Pending
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {orderStats.cancelled}
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Cancelled
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="search"
                        name="search"
                        placeholder="Search orders by product name, order ID..."
                        className="p-3 text-sm outline-none flex-1 rounded-l-lg"
                      />
                      <button
                        type="submit"
                        className="h-full px-4 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-r-lg flex items-center gap-2 transition-colors"
                      >
                        <SearchIcon sx={{ fontSize: "20px" }} />
                        <span className="text-sm font-medium">Search</span>
                      </button>
                    </div>

                    {/* Items Per Page Selector */}
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </form>

                  {/* Filters Panel */}
                  {showFilters && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <select
                          value={filters.status}
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <select
                          value={filters.paymentStatus}
                          onChange={(e) =>
                            handleFilterChange("paymentStatus", e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any Time</option>
                          <option value="7">Last 7 days</option>
                          <option value="30">Last 30 days</option>
                          <option value="90">Last 3 months</option>
                          <option value="365">Last year</option>
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
                          {pagination.totalOrders} orders found
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Orders List */}
              {orders.length === 0 ? (
                <div className="flex items-center flex-col gap-4 p-12 bg-white rounded-lg shadow-sm border">
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
                        : "Start shopping to see your orders here"}
                    </p>
                  </div>
                  <Link
                    to="/products"
                    className="bg-blue-500 py-3 px-6 text-white uppercase shadow hover:shadow-lg rounded-lg text-sm font-medium transition-all hover:scale-105"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Orders Count */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm text-gray-600">
                      Showing {orders.length} of {pagination.totalOrders} orders
                      {search && ` for "${search}"`}
                    </span>
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                  </div>

                  {/* Orders Items */}
                  {orders.map((order, orderIndex) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow-sm border overflow-hidden"
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
                            <span>Items:</span>
                            <span className="font-medium">
                              {order.orderItems.length}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="font-semibold text-gray-900">
                              ₹{order.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="divide-y">
                        {order.orderItems.map((item, itemIndex) => (
                          <OrderItem
                            item={item}
                            orderId={order.cashfreeOrderId}
                            orderStatus={order.orderStatus}
                            createdAt={order.createdAt}
                            paymentInfo={order.paymentInfo}
                            buyer={order.buyer}
                            shippingAddress={order.shippingAddress}
                            itemsPrice={order.itemsPrice}

                            totalItems={order.orderItems.length}
                            itemIndex={itemIndex}
                            orderIndex={orderIndex}
                            paymentStatus={order.paymentStatus}
                            totalPrice={order.totalPrice}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-6 py-4 bg-white rounded-lg shadow-sm border">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.totalPages} •{" "}
                    {pagination.totalOrders} total orders
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrev}
                      className={`px-3 py-2 rounded border text-sm font-medium ${
                        pagination.hasPrev
                          ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      First
                    </button>

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

                    <div className="flex gap-1">
                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded border text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

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

                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNext}
                      className={`px-3 py-2 rounded border text-sm font-medium ${
                        pagination.hasNext
                          ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Orders;

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import OrderItem from "./OrderItem";
// import SearchIcon from "@mui/icons-material/Search";
// import MinCategory from "../../../components/MinCategory";
// import Spinner from "../../../components/Spinner";
// import axios from "axios";
// import { useSelector } from "react-redux";

// const Orders = () => {
//   const auth = useSelector((s) => s.auth);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [orders, setOrders] = useState([]);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalOrders: 0,
//     hasNext: false,
//     hasPrev: false,
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const limit = 10; // You can make this configurable

//   // fetch orders from server
//   const fetchOrders = async (page = 1) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${import.meta.env.VITE_SERVER_URL}/api/v1/order?page=${page}&limit=${limit}`,
//         {
//           headers: { Authorization: `Bearer ${auth.token}` },
//         }
//       );

//       const ordersData = response?.data?.data?.orders;
//       const paginationData = response?.data?.data?.pagination;

//       if (ordersData) {
//         setOrders(ordersData);
//         setPagination(paginationData);
//         setCurrentPage(page);
//       }
//     } catch (error) {
//       console.log("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(1);
//   }, [auth?.token]);

//   // Handle search
//   const handleSearch = (e) => {
//     e.preventDefault();
//     // Reset to first page when searching
//     fetchOrders(1);
//   };

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages) {
//       fetchOrders(newPage);
//       // Scroll to top when changing pages
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;

//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

//     // Adjust start page if we're near the end
//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   return (
//     <>
//       <MinCategory />
//       <main className="w-full px-4 sm:px-10 py-4 ">
//         {/* <!-- row --> */}
//         {/* <!-- orders column --> */}
//         <div className="flex gap-3.5 w-full ">
//           {loading ? (
//             <div className="flex justify-center items-center w-full py-10">
//               <Spinner />
//             </div>
//           ) : (
//             <div className="flex flex-col gap-3 w-full pb-5 overflow-hidden">
//               {/* <!-- searchbar --> */}
//               <form
//                 onSubmit={handleSearch}
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

//               {/* Orders Count */}
//               {orders.length > 0 && (
//                 <div className="text-sm text-gray-600 text-center sm:text-left">
//                   Showing {orders.length} of {pagination.totalOrders} orders
//                 </div>
//               )}

//               {orders && orders.length === 0 && (
//                 <div className="flex items-center flex-col gap-2 p-10 bg-white rounded-sm shadow-md">
//                   <img
//                     draggable="false"
//                     src="https://rukminim1.flixcart.com/www/100/100/promos/23/08/2020/c5f14d2a-2431-4a36-b6cb-8b5b5e283d4f.png"
//                     alt="Empty Orders"
//                     className="w-24 h-24"
//                   />
//                   <span className="text-lg font-medium">
//                     Sorry, no orders found
//                   </span>
//                   <p>Place a new order from here</p>
//                   <Link
//                     to="/products"
//                     className="bg-blue-500 py-2 px-4 mt-1 text-white uppercase shadow hover:shadow-lg rounded-sm text-sm"
//                   >
//                     Products
//                   </Link>
//                 </div>
//               )}

//               {/* Orders List */}
//               {orders && orders.map((order, orderIndex) => {
//                 const {
//                   _id,
//                   cashfreeOrderId,
//                   buyer,
//                   orderItems,
//                   shippingAddress,
//                   itemsPrice,
//                   orderStatus,
//                   paymentInfo,
//                   createdAt,
//                 } = order;

//                 return orderItems.map((item, index) => (
//                   <OrderItem
//                     item={item}
//                     index={orderIndex +1}
//                     key={`${_id}-${index}`}
//                     orderId={cashfreeOrderId}
//                     orderStatus={orderStatus}
//                     createdAt={createdAt}
//                     paymentInfo={paymentInfo}
//                     buyer={buyer}
//                     shippingAddress={shippingAddress}
//                     itemsPrice={itemsPrice}
//                   />
//                 ));
//               })}

//               {/* Pagination Component */}
//               {pagination.totalPages > 1 && (
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-300">
//                   {/* Page Info */}
//                   <div className="text-sm text-gray-600">
//                     Page {currentPage} of {pagination.totalPages}
//                   </div>

//                   {/* Pagination Controls */}
//                   <div className="flex items-center gap-2">
//                     {/* Previous Button */}
//                     <button
//                       onClick={() => handlePageChange(currentPage - 1)}
//                       disabled={!pagination.hasPrev}
//                       className={`px-3 py-2 rounded border text-sm font-medium ${
//                         pagination.hasPrev
//                           ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
//                           : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//                       }`}
//                     >
//                       Previous
//                     </button>

//                     {/* Page Numbers */}
//                     <div className="flex gap-1">
//                       {getPageNumbers().map((pageNum) => (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           className={`w-10 h-10 rounded border text-sm font-medium ${
//                             currentPage === pageNum
//                               ? "bg-blue-500 text-white border-blue-500"
//                               : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       ))}

//                       {/* Ellipsis for many pages */}
//                       {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
//                         <span className="px-2 py-2 text-gray-500">...</span>
//                       )}
//                     </div>

//                     {/* Next Button */}
//                     <button
//                       onClick={() => handlePageChange(currentPage + 1)}
//                       disabled={!pagination.hasNext}
//                       className={`px-3 py-2 rounded border text-sm font-medium ${
//                         pagination.hasNext
//                           ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
//                           : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//                       }`}
//                     >
//                       Next
//                     </button>
//                   </div>

//                   {/* Items Per Page (Optional) */}
//                   <div className="text-xs text-gray-500">
//                     {limit} orders per page
//                   </div>
//                 </div>
//               )}

//               {/* Mobile Pagination (Simplified) */}
//               {pagination.totalPages > 1 && (
//                 <div className="sm:hidden flex items-center justify-between gap-2 mt-4 px-3 py-2 bg-white rounded-lg shadow-sm border">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!pagination.hasPrev}
//                     className={`flex-1 py-2 rounded text-sm font-medium ${
//                       pagination.hasPrev
//                         ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
//                         : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <span className="text-sm text-gray-600 px-2">
//                     {currentPage}/{pagination.totalPages}
//                   </span>

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!pagination.hasNext}
//                     className={`flex-1 py-2 rounded text-sm font-medium ${
//                       pagination.hasNext
//                         ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
//                         : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//         {/* <!-- orders column --> */}
//         {/* <!-- row --> */}
//       </main>
//     </>
//   );
// };

// export default Orders;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderItem from "./OrderItem";
import SearchIcon from "@mui/icons-material/Search";
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
  const limit = 10; // You can make this configurable

  // fetch orders from server
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/order?page=${page}&limit=${limit}`,
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
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [auth?.token]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    fetchOrders(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <>
      <MinCategory />
      <main className="w-full px-4 sm:px-10 py-4 ">
        {/* <!-- row --> */}
        {/* <!-- orders column --> */}
        <div className="flex gap-3.5 w-full ">
          {loading ? (
            <div className="flex justify-center items-center w-full py-10">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full pb-5 overflow-hidden">
              {/* <!-- searchbar --> */}
              <form
                onSubmit={handleSearch}
                className="flex items-center justify-between mx-auto w-[100%] sm:w-10/12 bg-white border rounded mb-2 hover:shadow-md"
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="search"
                  name="search"
                  placeholder="Search your orders here"
                  className="p-2 text-sm outline-none flex-1 rounded-l "
                />
                <button
                  type="submit"
                  className="h-full text-sm px-1 sm:px-4 py-2.5 text-white bg-blue-500 hover:bg-blue-600 rounded-r flex items-center gap-1"
                >
                  <SearchIcon sx={{ fontSize: "20px" }} />
                  <p className="text-[10px] sm:text-[14px]">Search</p>
                </button>
              </form>
              {/* <!-- search bar --> */}

              {/* Orders Count */}
              {orders.length > 0 && (
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Showing {orders.length} of {pagination.totalOrders} orders
                </div>
              )}

              {orders && orders.length === 0 && (
                <div className="flex items-center flex-col gap-2 p-10 bg-white rounded-sm shadow-md">
                  <img
                    draggable="false"
                    src="https://rukminim1.flixcart.com/www/100/100/promos/23/08/2020/c5f14d2a-2431-4a36-b6cb-8b5b5e283d4f.png"
                    alt="Empty Orders"
                    className="w-24 h-24"
                  />
                  <span className="text-lg font-medium">
                    Sorry, no orders found
                  </span>
                  <p>Place a new order from here</p>
                  <Link
                    to="/products"
                    className="bg-blue-500 py-2 px-4 mt-1 text-white uppercase shadow hover:shadow-lg rounded-sm text-sm"
                  >
                    Products
                  </Link>
                </div>
              )}

              {/* Orders List */}
              {orders && orders.map((order, orderIndex) => {
                const {
                  _id,
                  cashfreeOrderId,
                  buyer,
                  orderItems,
                  shippingAddress,
                  itemsPrice,
                  orderStatus,
                  paymentInfo,
                  createdAt,
                } = order;

                return orderItems.map((item, index) => (
                  <OrderItem
                    item={item}
                    index={orderIndex +1}
                    key={`${_id}-${index}`}
                    orderId={cashfreeOrderId}
                    orderStatus={orderStatus}
                    createdAt={createdAt}
                    paymentInfo={paymentInfo}
                    buyer={buyer}
                    shippingAddress={shippingAddress}
                    itemsPrice={itemsPrice}
                  />
                ));
              })}

              {/* Pagination Component */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-300">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.totalPages}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
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

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded border text-sm font-medium ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      {/* Ellipsis for many pages */}
                      {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                    </div>

                    {/* Next Button */}
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

                  {/* Items Per Page (Optional) */}
                  <div className="text-xs text-gray-500">
                    {limit} orders per page
                  </div>
                </div>
              )}

              {/* Mobile Pagination (Simplified) */}
              {pagination.totalPages > 1 && (
                <div className="sm:hidden flex items-center justify-between gap-2 mt-4 px-3 py-2 bg-white rounded-lg shadow-sm border">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`flex-1 py-2 rounded text-sm font-medium ${
                      pagination.hasPrev
                        ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600 px-2">
                    {currentPage}/{pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`flex-1 py-2 rounded text-sm font-medium ${
                      pagination.hasNext
                        ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* <!-- orders column --> */}
        {/* <!-- row --> */}
      </main>
    </>
  );
};

export default Orders;
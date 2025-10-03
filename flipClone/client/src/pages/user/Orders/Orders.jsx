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

  // fetch orders from server
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/order`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        let orders = response?.data?.data.orders;
        let pagination = response?.data?.data.pagination;
        console.log(response)
        if (orders) {
          setOrders(orders);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [auth?.token]);

  return (
    <>
      <MinCategory />
      <main className="w-full px-4 sm:px-10 py-4 ">
        {/* <!-- row --> */}
        {/* <!-- orders column --> */}
        <div className="flex gap-3.5 w-full ">
          {loading ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-3 w-full pb-5 overflow-hidden">
              {/* <!-- searchbar --> */}
              <form
                // onSubmit={searchOrders}
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
                  className="h-full text-sm px-1 sm:px-4 py-2.5 text-white bg-primaryBlue hover:bg-blue-600 rounded-r flex items-center gap-1"
                >
                  <SearchIcon sx={{ fontSize: "20px" }} />
                  <p className="text-[10px] sm:text-[14px]">Search</p>
                </button>
              </form>
              {/* <!-- search bar --> */}

              {orders && orders?.length === 0 && (
                <div className="flex items-center flex-col gap-2 p-10 bg-white rounded-sm shadow-md">
                  <img
                    draggable="false"
                    src="https://rukminim1.flixcart.com/www/100/100/promos/23/08/2020/c5f14d2a-2431-4a36-b6cb-8b5b5e283d4f.png"
                    alt="Empty Orders"
                  />
                  <span className="text-lg font-medium">
                    Sorry, no orders found
                  </span>
                  <p>Place a new order from here</p>
                  <Link
                    to="/products"
                    className="bg-primaryBlue py-2 px-4 mt-1 text-white uppercase shadow hover:shadow-lg rounded-sm text-sm"
                  >
                    Products
                  </Link>
                </div>
              )}

              {orders && orders?.map((order) => {
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
                      key={index}
                      orderId={cashfreeOrderId}
                      orderStatus={orderStatus}
                      createdAt={createdAt}
                      paymentInfo={paymentInfo}
                      buyer={buyer}
                      shippingAddress={shippingAddress}
                      itemsPrice={itemsPrice}
                    />
                  ));
                })
                .reverse()}
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

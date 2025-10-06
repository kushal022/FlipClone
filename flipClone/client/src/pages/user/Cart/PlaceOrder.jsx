import React, { useState } from "react";
import Address from "../../../components/address/Address";
import AddressList from "../../../components/address/AddressList";
import PriceCard from "./PriceCard";
import { useSelector } from "react-redux";
import {
  AiFillDownCircle,
  AiOutlineCheck,
  AiOutlinePlus,
  AiOutlineRight,
} from "react-icons/ai";
import CartItem from "./CartItem";
import Cart from "./Cart";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import Checkout from "./Checkout";
import { useEffect } from "react";
import { Save } from "@mui/icons-material";

const DeliveryAddressForm = () => {
  const { cartItem } = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  const [addNewAddress, setAddNewAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [email, setEmail] = useState("");

  //Session:
  const [sessionId, setSessionId] = useState(null);

  // If single item buy directly without added in cart then order item will be this:
  let orderItem;
  if (product) {
    orderItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      brandName: product.brandName,
      seller: product.seller,
      image: product.images[0].url,
      discountPrice: product.discountPrice,
      saveForLater: product.saveForLater,
      quantity: 1,
    };
  };


  //?PAYMENT USING CASH-FREE PAYMENT GATEWAY: Create session
  const handlePayment = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/order/cashfree/create-order`,
        {
          orderItems: orderItem || cartItem.items,
          orderAmount: product?.discountPrice || cartItem.totalDiscountPrice,
          shippingCharge: 0,
          customerName: auth.user?.fname + " " + auth.user?.lname,
          customerEmail: auth?.user?.email,
          customerAlternativeEmail: email,
          customerPhone: auth?.user?.phone,
          shippingAddress: selectedAddress,
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      let sessionId = res.data.cashfreeData.payment_session_id;
      if (!sessionId) {
        toast.error("Did not get SessionId");
        console.log("Did not get SessionId");
      }
      sessionId && setSessionId(sessionId);
    } catch (err) {
      console.error(err);
      toast.error("Payment initiation failed");
    }
  };

  const placeOrderHandler = () => {
    // console.log('click')
    if (selectedAddress == null) {
      toast.error("Please Add Your Shipping address!");
    } else {
      handlePayment();
    }
  };

  // Redirect to checkout page:
  if (sessionId) {
    // return <Checkout sessionId={sessionId} total={cartItem.totalDiscountPrice} />;
    navigate(
      `/user/place-order/checkout?id=${sessionId}&total=${
        product?.discountPrice || cartItem.totalDiscountPrice
      }`
    );
  }

  //*fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/product/${productId}`
        );
        // console.log(res.data.product);
        const product = res.data.data;
        if (res.data.success === true) {
          setProduct(product);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
        // product not found
        error.response?.status === 404 &&
          toast.error("Product Not Found!", {
            style: {
              top: "40px",
            },
          });

        //server error
        error.response?.status === 500 &&
          toast.error("Something went wrong! Please try after sometime.", {
            style: {
              top: "40px",
            },
          });
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return (
    <>
      {/* <div className="mx-8 pt-4"></div> */}

      <div className="flex flex-col lg:flex-row gap-6 w-full p-4 md:p-6 bg-gray-100 shadow rounded-md">
        <main className="flex flex-col gap-4 w-full">
          {/* --------- Address Container ---------- */}
          <section className="w-full ">
            <div className="flex justify-between items-center w-full shadow  bg-white ">
              <div className="w-full ">
                <p
                  className={`w-full flex gap-3 px-6 p-3 font-bold uppercase ${
                    selectedAddress
                      ? "bg-white text-gray-500"
                      : "bg-blue-500 text-white"
                  } transition-all `}
                >
                  DELIVERY ADDRESS
                  {selectedAddress && (
                    <span className="text-blue-500">
                      <AiOutlineCheck size={25} />
                    </span>
                  )}
                </p>
                {selectedAddress && (
                  <p className="flex gap-2 px-6 pb-3">
                    <span className="font-semibold">
                      {selectedAddress.fullName}
                    </span>
                    <span className="">{selectedAddress.street}</span>
                    <span className="">{selectedAddress.city}</span>
                    <span className="font-semibold">
                      {selectedAddress.state}-{selectedAddress.pincode}
                    </span>
                  </p>
                )}
              </div>
              {selectedAddress && (
                <button
                  onClick={() => setSelectedAddress(null)}
                  className="bg-white border mr-3 border-gray-300 text-blue-500 text-lg font-[500] rounded-sm px-5 py-1 cursor-pointer  hover:shadow transition-all"
                >
                  Change
                </button>
              )}
            </div>
            <div className="w-full">
              {!selectedAddress && (
                <div className="mx-0 my-1">
                  <AddressList setSelectedAddress={setSelectedAddress} />
                </div>
              )}

              {
                <Address
                  title={"delivery address"}
                  open={addNewAddress}
                  setAddNewAddress={setAddNewAddress}
                />
              }
              {!addNewAddress && (
                <button
                  onClick={() => setAddNewAddress(true)}
                  className={`${
                    selectedAddress == null ? "" : "hidden"
                  } w-full flex gap-4 shadow text-blue-500 font-bold px-6 p-3 uppercase bg-white transition-all cursor-pointer`}
                >
                  <AiOutlinePlus size={25} />
                  <span>Add New Address</span>
                </button>
              )}
            </div>
          </section>
          {/* ---------- Summary Container ------------- */}
          <section className="w-full">
            <div className="flex justify-between items-center w-full shadow   ">
              <div className="w-full ">
                <p
                  className={`w-full flex gap-3 px-6 p-3 font-bold uppercase bg-blue-500 text-white transition-all `}
                >
                  {" "}
                  order summary {product == null ? "-Cart" : ""}{" "}
                </p>
              </div>
            </div>

            {/* <!-- cart items container --> */}
            {selectedAddress != null && (
              <div className="flex flex-col shadow bg-white">
                {product == null &&
                  (cartItem.items == undefined ||
                  cartItem?.items?.length == 0 ? (
                    <EmptyCart />
                  ) : (
                    cartItem?.items?.map((item, i) => (
                      <CartItem product={item} inCart={true} key={i} />
                    ))
                  ))}
                {product !== null && <CartItem product={product} />}
              </div>
            )}
          </section>
          {/* ---------- Continue btn Container ------------- */}
          <section className="w-full flex items-center justify-between bg-white px-8 py-4 shadow">
            <div>
              <label className="">
                Order confirmation email will be send to
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ml-4 focus:outline-none border-b border-gray-300"
                  placeholder="Enter your Email Id"
                />
              </label>
            </div>
            <button
              onClick={placeOrderHandler}
              className="bg-orange-500 uppercase text-white text-lg font-[500] rounded-sm px-6 py-3 cursor-pointer hover:bg-orange-400 hover:shadow transition-all"
            >
              Continue
            </button>
          </section>
        </main>
        {/* --------------- RIGHT SECTION - PRICE DETAILS --------------*/}
        <PriceCard
          product={product}
          cartItems={cartItem?.items}
          totalItems={cartItem.totalItems}
        />
      </div>
    </>
  );
};

export default DeliveryAddressForm;

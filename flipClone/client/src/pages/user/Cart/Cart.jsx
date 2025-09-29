import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import SaveForLater from "./SaveForLater";
import ScrollToTopOnRouteChange from "./../../../utils/ScrollToTopOnRouteChange";
import PriceCard from "./PriceCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCart } from "../../../redux/asyncThunk/cart";
import { toast } from "react-toastify";
import PaymentPage from "./redirect";

const Cart = () => {
  const auth = useSelector((state) => state.auth);
  const { cartItem } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [saveLaterItems, setSaveLaterItems] = useState(
    cartItem?.items?.filter((item) => item.SaveForLater === true) || []
  );

  let frontendURL = window.location.origin; // Get the frontend URL
  const [ sessionId, setSessionId ] = useState(null)

  //PAYMENT USING CASH-FREE PAYMENT GATEWAY: Create session
   const handlePayment = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/order/cashfree/create-order`, 
        {
        orderItems: cartItem.items,
        orderAmount: cartItem.totalDiscountPrice,
        shippingCharge: 0,
        customerName: auth.user?.fname + " "+ auth.user?.lname,
        customerEmail: auth?.user?.email,
        customerPhone: auth?.user?.phone,
        shippingAddress: auth?.user?.address,
      });

      let sessionId = res.data.cashfreeData.payment_session_id;
      sessionId && setSessionId(sessionId)
      // const { paymentLink } = res.data;
      // if (paymentLink) {
      //   window.location.href = paymentLink; // redirect to Cashfree-hosted checkout
      // } else {
      //   toast.error("Could not create payment link");
      // }
    } catch (err) {
      console.error(err);
      toast.error("Payment initiation failed");
    }
  };

  const placeOrderHandler = () => {
      handlePayment();
  };

  // console.log(cartItem)
  // Redirect session page:
  if (sessionId){
      return <PaymentPage sessionId={sessionId} />
  }

  return (
    <>
      <ScrollToTopOnRouteChange />
      <main className="w-full pt-5">
        {/* <!-- row --> */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto ">
          {/* <!-- cart column --> */}
          <div className="flex-1">
            {/* <!-- cart items container --> */}
            <div className="flex flex-col shadow bg-white">
              <span className="font-medium text-lg px-2 sm:px-8 py-4 border-b">
                My Cart ({cartItem?.totalItems || cartItem?.items?.length || 0 })
              </span>
              { cartItem.items == undefined || cartItem?.items?.length == 0 ? (
                <EmptyCart />
              ) : (
                cartItem?.items?.map((item, i) => (
                  <CartItem product={item} inCart={true} key={i} />
                ))
              )}
              {/* <!-- place order btn --> */}
              <div className="flex justify-between items-center sticky bottom-0 left-0 bg-white">
                {/* test card details */}
                <div
                  className={`text-xs p-2 ${
                    cartItem?.totalItems < 1 || cartItem?.items?.length < 1 || cartItem.items == undefined
                      ? "hidden"
                      : "inline-block"
                  } w-full`}
                >
                  {/* <p>
                                        For payment purposes, you can use the
                                        following test card details:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Card Number:</strong> 4242
                                            4242 4242 4242
                                        </li>
                                        <li>
                                            <strong>Expiry Date:</strong> Any
                                            future date (e.g., 12/25)
                                        </li>
                                        <li>
                                            <strong>CVV:</strong> Any 3-digit
                                            number (e.g., 123)
                                        </li>
                                    </ul> */}
                </div>

                <button
                  onClick={placeOrderHandler}
                  disabled={(cartItem?.items?.length < 1 ? true : false) || cartItem?.totalItems < 1 || cartItem?.items?.length < 1 || cartItem.items == undefined}
                  className={`${
                    cartItem?.totalItems < 1 || cartItem?.items?.length < 1 || cartItem.items == undefined ? "hidden" : "bg-yellow-400"
                  } w-full sm:w-1/3 mx-2 sm:mx-6 my-4 py-4 font-medium bg-blue-500 text-white shadow hover:shadow-lg rounded-sm cursor-pointer `}
                >
                  PLACE ORDER
                </button>
              </div>
              {/* <!-- place order btn --> */}
            </div>
            {/* <!-- cart items container --> */}

            {/* <!-- saved for later items container --> */}
            <div className="flex flex-col mt-5 shadow bg-white mb-8">
              <span className="font-medium text-lg px-2 sm:px-8 py-4 border-b">
                Saved For Later ({cartItem.savedItems?.length || 0})
              </span>
              {cartItem?.savedItems?.map((item, i) => (
                <SaveForLater product={item} key={i} />
              ))}
            </div>
            {/* <!-- saved for later container --> */}
          </div>
          {/* <!-- cart column --> */}

          <PriceCard
            cartItems={cartItem?.items}
            totalItems={cartItem.totalItems}
          />
        </div>
        {/* <!-- row --> */}
      </main>
    </>
  );
};

export default Cart;

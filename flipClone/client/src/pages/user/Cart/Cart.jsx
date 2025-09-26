import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import SaveForLater from "./SaveForLater";
import ScrollToTopOnRouteChange from "./../../../utils/ScrollToTopOnRouteChange";
import PriceCard from "./PriceCard";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCart } from "../../../redux/asyncThunk/cart";

const Cart = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { cartItem } = useSelector((state) => state.cart);
  const [saveLaterItems, setSaveLaterItems] = useState(
    cartItem?.items?.filter((item) => item.SaveForLater === true) || []
  );

  //stripe details
  const publishKey = import.meta.env.VITE_STRIPE_PUBLISH_KEY;
  const secretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
  let frontendURL = window.location.origin; // Get the frontend URL

  // //PAYMENT USING STRIPE
  // const handlePayment = async () => {
  //     const stripe = await loadStripe(publishKey);

  //     const response = await axios.post(
  //         `${
  //             import.meta.env.VITE_SERVER_URL
  //         }/api/v1/user/create-checkout-session`,
  //         {
  //             products: cartItem?.items,
  //             frontendURL: frontendURL,
  //             customerEmail: auth?.user?.email,
  //         },
  //         {
  //             headers: {
  //                 Authorization: auth?.token,
  //             },
  //         }
  //     );
  //     const session = response.data.session;
  //     console.log("session: ", session);
  //     //storing session id to retrieve payment details after successful
  //     localStorage.setItem("sessionId", session.id);
  //     const result = stripe.redirectToCheckout({
  //         sessionId: session.id,
  //     });
  //     console.log("result: ", result);

  //     if (result.error) {
  //         console.log(result.error);
  //     }
  // };

  // const placeOrderHandler = () => {
  //     handlePayment();
  // };

  // console.log(cartItem)

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
                My Cart ({cartItem?.totalItems || cartItem?.items?.length})
              </span>
              {cartItem?.totalItems === 0 || cartItem?.items.length === 0 ? (
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
                    cartItem?.totalItems < 1 || cartItem?.items.length < 1
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
                  // onClick={placeOrderHandler}
                  disabled={cartItem?.items?.length < 1 ? true : false}
                  className={`${
                    cartItem?.items?.length < 1 ? "hidden" : "bg-orange"
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
                Saved For Later ({saveLaterItems?.length})
              </span>
              {saveLaterItems?.map((item, i) => (
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

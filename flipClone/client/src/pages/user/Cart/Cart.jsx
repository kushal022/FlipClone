import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import SaveForLater from "./SaveForLater";
import ScrollToTopOnRouteChange from "./../../../utils/ScrollToTopOnRouteChange";
import PriceCard from "./PriceCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Cart = () => {
  const navigate = useNavigate()
  const auth = useSelector((state) => state.auth);
  const { cartItem } = useSelector((state) => state.cart);

  const placeOrderHandler = () => {
    navigate('/user/place-order')
  };

  return (
    <>
      <ScrollToTopOnRouteChange />
      <main className="w-full pt-5">
        {/* <!-- row --> */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto ">
          {/* <!-- cart column --> */}
          <div className="flex-1">
            {/* <!-- Address container --> */}
            {/* <div className="flex shadow bg-white mb-3">
              <div>
                <p>{auth?.user?.address}</p>
              </div>
              <div>
                <button>Change</button>
              </div>
            </div> */}

            {/* <!-- cart items container --> */}
            <div className="flex flex-col shadow bg-white">
              <span className="font-medium text-lg px-2 sm:px-8 py-4 border-b border-gray-300">
                My Cart ({cartItem?.totalItems || cartItem?.items?.length || 0})
              </span>
              {cartItem.items == undefined || cartItem?.items?.length == 0 ? (
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
                    cartItem?.totalItems < 1 ||
                    cartItem?.items?.length < 1 ||
                    cartItem.items == undefined
                      ? "hidden"
                      : "inline-block"
                  } w-full`}
                >
                  {/* <p>
                    For payment purposes, you can use the following test card
                    details:
                  </p>
                  <ul>
                    <li>
                      <strong>Card Number:</strong> 4242 4242 4242 4242
                    </li>
                    <li>
                      <strong>Expiry Date:</strong> Any future date (e.g.,
                      12/25)
                    </li>
                    <li>
                      <strong>CVV:</strong> Any 3-digit number (e.g., 123)
                    </li>
                  </ul> */}
                </div>

                <button
                  onClick={placeOrderHandler}
                  disabled={
                    (cartItem?.items?.length < 1 ? true : false) ||
                    cartItem?.totalItems < 1 ||
                    cartItem?.items?.length < 1 ||
                    cartItem.items == undefined
                  }
                  className={`${
                    cartItem?.totalItems < 1 ||
                    cartItem?.items?.length < 1 ||
                    cartItem.items == undefined
                      ? "hidden"
                      : " "
                  } w-full sm:w-1/3 mx-2 sm:mx-6 my-4 py-4 font-medium bg-orange-500 text-white shadow hover:shadow-lg rounded-sm cursor-pointer `}
                >
                  PLACE ORDER
                </button>
              </div>
              {/* <!-- place order btn --> */}
            </div>
            {/* <!-- cart items container --> */}

            {/* <!-- saved for later items container --> */}
            <div className="flex flex-col mt-5 shadow bg-white mb-8">
              <span className="font-medium text-lg px-2 sm:px-8 py-4 border-b border-gray-300">
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

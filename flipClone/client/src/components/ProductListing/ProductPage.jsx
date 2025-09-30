// icons
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import StarIcon from "@mui/icons-material/Star";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CachedIcon from "@mui/icons-material/Cached";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import Slider from "react-slick";

import { NextBtn, PreviousBtn } from "../../pages/Home/Banner/Banner.jsx";
import ProductSlider from "../../pages/Home/ProductsListing/ProductSlider.jsx";
import Spinner from "../../components/Spinner";
import { getDeliveryDate, getDiscount } from "../../utils/functions";
import MinCategory from "../../components/MinCategory";
import axios from "axios";
import { fashionProducts } from "../../utils/fashion";
import { electronicProducts } from "../../utils/electronics";
import ScrollToTopOnRouteChange from "../../utils/ScrollToTopOnRouteChange";
import { addToCart } from "../../redux/asyncThunk/cart.js";
import { setAddSuccess } from "../../redux/slices/cart.js";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const { user, token, isAdmin, isLoading } = useSelector(
    (state) => state.auth
  );
  const { cartItem, addSuccess, isLoadingCart } = useSelector(
    (state) => state.cart
  );
  const dispatch = useDispatch();

  // reviews toggle
  const [open, setOpen] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loadMore, setLoadMore] = useState(false);

  const [wishlistItems, setWishlistItems] = useState([]); // store fetched wishlist items ids
  const [product, setProduct] = useState({}); // store fetched products
  const [loading, setLoading] = useState(true);
  const [itemInCart, setItemInCart] = useState(null);

  //slider settings
  const settings = {
    autoplay: false,
    autoplaySpeed: 3000,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PreviousBtn />,
    nextArrow: <NextBtn />,
  };

  //* Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/v1/review/get-review/${productId}?page=${page}&limit=${limit}`
      );
      const reviews = res.data.data;
      console.log(res);
      setReviews(reviews);
    } catch (error) {
      console.error("Fetch reviews failed: ", error);
      toast.error("Fetch reviews failed!");
    }
  };

  // console.log('reviews: ', reviews)

  useEffect(() => {
    fetchReviews();
    console.log("fetched reviews");
  }, [productId]);

  //* Review submit handler:
  const reviewSubmitHandler = async () => {
    try {
      if (rating === 0 || !comment.trim()) {
        toast.error("Empty Review", {
          style: { top: "40px" },
        });
        return;
      }
      const formData = new FormData();
      formData.set("rating", rating);
      formData.set("comment", comment);
      formData.set("productId", productId);

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/review/add-review`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(res)
      res.data.success === true &&
        toast.success(`${res.data.message}`) &&
        fetchReviews();

      res.data.success === false && toast.error(`${res.data.message}`);
      setOpen(false);
    } catch (error) {
      console.log("Error in add review", error);
      toast.error(`${error.response.data.message}`);
      // toast.error("Error in add review")
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setRating(0);
    setComment("");
  };

  //& Check if item is in cart
  const checkItemInCart = () => {
    if (cartItem?.items && productId) {
      const result = cartItem.items.some(
        (item) => item.productId === productId
      );
      setItemInCart(result);
    }
  };

  //& Update itemInCart when cartItem or productId changes
  useEffect(() => {
    checkItemInCart();
  }, [cartItem, productId, addSuccess]);

  const goToCart = () => {
    navigate(`/user/${user._id}/cart`);
    // checkItemInCart()
    dispatch(setAddSuccess());
  };

  const buyNow = () => {
    if (!itemInCart) {
      addToCartHandler();
    }
    setTimeout(() => {
      goToCart();
    }, 500);
  };

  //* Add to cart handler:
  const addToCartHandler = () => {
    const item = {
      productId: product._id,
      name: product.name,
      stock: product.stock,
      image: product.images[0].url,
      brandName: product.brand.name,
      price: product.price,
      discountPrice: product.discountPrice,
      seller: product.seller,
      quantity: 1,
    };
    dispatch(addToCart(item));
    // checkItemInCart()
  };

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
          // Check if this product is in cart after product is loaded
          checkItemInCart();
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
    fetchProduct();
  }, [productId]);

  //*fetch wishlist items
  useEffect(() => {
    //fetch wishlist items
    const fetchWishlistItems = async () => {
      try {
        // only id of wishlist products will get
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/user/wishlist`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const wishlistItems = res.data.data;
        setWishlistItems(wishlistItems);
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
      }
    };
    token && !isAdmin && fetchWishlistItems();
  }, [isLoading, token, user, isAdmin]);

  let itemInWishlist = wishlistItems?.find((id) => id === productId);
  // Wishlist icon/UI update
  const updateWishlistUI = (add) => {
    setWishlistItems((prev) =>
      add ? [...prev, product._id] : prev.filter((item) => item !== product._id)
    );
  };
  //* Add to wishlist handler:
  const addToWishlistHandler = async () => {
    let type = itemInWishlist ? "remove" : "add";
    try {
      // Update the UI before the API call
      updateWishlistUI(type === "add");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/user/update-wishlist`,
        {
          productId: productId,
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(res);
      res.data.success === true &&
        toast.success(
          type === "add"
            ? "Product Added To Wishlist"
            : "Product Removed From Wishlist",
          {
            style: {
              top: "40px",
            },
          }
        );
    } catch (error) {
      console.log(error);
      // Revert UI update if there is an error
      updateWishlistUI(type !== "add");
      toast.error("Something went wrong!", {
        style: {
          top: "40px",
        },
      });
    }
  };

  // offers List:
  const offers = [
    "Flat ₹200 off on HDFC Bank Credit/Debit Card on 3 months EMI Txns, Min Txn Value ₹10,000",
    "10% Instant Discount on ICICI Bank Credit Card Txns, up to ₹1250, on orders of ₹5000 and above",
    "Flat ₹500 off on HDFC Bank Credit/Debit Card on 6 months EMI Txns, Min Txn Value ₹10,000",
    "5% Unlimited Cashback on Flipkart Axis Bank Credit Card",
  ];

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <ScrollToTopOnRouteChange />
          <MinCategory />
          <main className="mt-5 sm:mt-0">
            {/* <!-- product image & description container start --> */}
            <div className="w-full flex flex-col lg:flex-row bg-white sm:p-2 relative">
              {/* <!-- image wrapper / Right side--> */}
              <div className="w-full lg:w-2/5 lg:sticky top-16 lg:h-screen">
                {/* <!-- imgBox --> */}
                <div className="flex flex-col gap-3 m-3 ">
                  <div className="w-full lg:w-[450px] h-full pb-6 border border-gray-200 relative">
                    <Slider {...settings}>
                      {product?.images?.length > 1 ? (
                        product?.images?.map((item, i) => (
                          <img
                            draggable="false"
                            className="w-full h-96 object-contain"
                            src={item.url}
                            alt={product.name}
                            key={i}
                          />
                        ))
                      ) : (
                        <img
                          draggable="false"
                          className="w-full h-96 object-contain"
                          src={product?.images[0]?.url}
                          alt={product?.name}
                        />
                      )}
                    </Slider>
                    {/* wishlist icon */}
                    <div
                      className={`absolute top-4 right-4 shadow-lg bg-white w-9 h-9 border border-gray-300 flex items-center justify-center rounded-full ${
                        isAdmin === "admin" ? "hidden" : ""
                      } `}
                    >
                      <span
                        onClick={addToWishlistHandler}
                        className={`${
                          itemInWishlist
                            ? "text-red-500"
                            : "hover:text-red-500 text-gray-300"
                        } cursor-pointer`}
                      >
                        <FavoriteIcon sx={{ fontSize: "18px" }} />
                      </span>
                    </div>
                  </div>

                  {/* <!-- add to cart btn --> */}
                  <div className="w-full flex gap-3">
                    {product.stock > 0 && (
                      <button
                        onClick={itemInCart ? goToCart : addToCartHandler}
                        disabled={isAdmin}
                        className={` text-white disabled:cursor-not-allowed p-2 sm:p-4 w-1/2 flex items-center justify-center gap-2  bg-[#ff9f00] rounded-sm shadow cursor-pointer hover:shadow-lg`}
                      >
                        <ShoppingCartIcon />
                        {itemInCart ? "GO TO CART" : "ADD TO CART"}
                      </button>
                    )}
                    {/*  ---- by now btn--- */}
                    <button
                      onClick={buyNow}
                      disabled={isAdmin || product.stock < 1}
                      className={`disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white rounded-sm shadow hover:shadow-lg p-4 cursor-pointer ${
                        product.stock < 1
                          ? " w-full bg-red-600 cursor-not-allowed"
                          : "w-1/2 bg-[#fb641b]"
                      }`}
                    >
                      <FlashOnIcon />
                      {product?.stock < 1 ? "OUT OF STOCK" : "BUY NOW"}
                    </button>
                    {/* <!-- add to cart btn --> */}
                  </div>
                </div>
                {/* <!-- img box --> */}
              </div>
              {/* <!-- image wrapper --> */}

              {/* <!-- product desc wrapper --> */}
              <section className="py-2 px-3 ">
                {/* <!-- whole product description --> */}
                <div className="flex flex-col gap-3 mb-4">
                  <h2 className="text-lg sm:text-xl">{product?.name}</h2>
                  {/* <!-- rating badge --> */}
                  <span className="text-md text-gray-500 font-medium flex gap-2 items-center">
                    <span className="text-xs px-1.5 py-0.5 bg-green-500 rounded-sm text-white flex items-center gap-0.5">
                      {product?.ratings?.toFixed(1)}{" "}
                      <StarIcon sx={{ fontSize: "12px" }} />
                    </span>
                    <span>{product?.numOfReviews} Reviews</span>
                    <span className="w-[80px] object-contain">
                      <img
                        src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png"
                        alt="f-assured"
                      />
                    </span>
                  </span>
                  {/* <!-- rating badge --> */}

                  {/* <!-- price desc --> */}
                  <div className="flex flex-col text-3xl">
                    <span className="text-green-500 text-sm font-medium">
                      Special Price
                    </span>
                    <div className="flex items-baseline gap-2 text-3xl font-medium">
                      <span className="text-gray-800">
                        ₹ {product?.discountPrice?.toLocaleString()}
                      </span>
                      <span className="text-base text-gray-500 line-through">
                        ₹ {product?.price?.toLocaleString()}
                      </span>
                      <span className="text-base text-green-500">
                        {getDiscount(product?.price, product?.discountPrice)}
                        %&nbsp;off
                      </span>
                    </div>
                  </div>
                  {product?.stock <= 10 && product?.stock > 0 && (
                    <span className="text-red-500 text-sm font-medium">
                      Hurry, Only {product.stock} left!
                    </span>
                  )}
                  {/* <!-- price desc --> */}

                  {/* <!-- banks offers --> */}
                  <p className="text-md font-[600]">Available offers</p>
                  {offers.map((el, i) => (
                    <div
                      className="flex gap-2 text-xs sm:text-sm leading-4"
                      key={i}
                    >
                      <div className="whitespace-nowrap flex items-start">
                        <LocalOfferIcon
                          sx={{
                            fontSize: "16px",
                          }}
                          style={{
                            color: "#16bd49",
                            marginTop: "2px",
                          }}
                        />
                        <span className="ml-1 font-semibold">Bank Offer</span>
                      </div>
                      <div className="flex items-start text-sm">
                        <span>
                          {el}
                          <Link
                            className="text-blue-500 text-[12px] font-medium ml-1"
                            to="./"
                          >
                            T&C
                          </Link>
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* <!-- banks offers --> */}

                  {/* <!-- warranty & brand --> */}
                  <div className="flex gap-8 mt-2 items-center text-sm">
                    <img
                      draggable="false"
                      className="w-20 h-8 p-0.5 border border-gray-300 object-contain"
                      src={product.brand?.logo.url}
                      alt={product?.brand?.name}
                    />
                    <span>
                      {product?.warranty === 0
                        ? "No Warranty"
                        : `${product?.warranty} Year Brand Warranty`}
                    </span>
                    <Link className="font-medium text-blue-500 -ml-5" to="/">
                      Know More
                    </Link>
                  </div>
                  {/* <!-- warranty & brand --> */}

                  {/* <!-- delivery details --> */}
                  <div className="flex gap-16 mt-4 items-center text-sm font-medium">
                    <p className="text-gray-500">Delivery</p>
                    <span>Delivery by {getDeliveryDate()} | ₹ 40</span>
                  </div>
                  {/* <!-- delivery details --> */}

                  {/* <!-- highlights & services details --> */}
                  <div className="flex flex-col sm:flex-row justify-between">
                    {/* <!-- highlights details --> */}
                    <div className="flex gap-16 mt-4 items-stretch text-sm">
                      <p className="text-gray-500 font-medium">Highlights</p>
                      <ul className="list-disc flex flex-col gap-2 w-64">
                        {product?.highlights?.map((highlight, i) => (
                          <li key={i}>
                            <p>{highlight}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* <!-- highlights details --> */}

                    {/* <!-- services details --> */}
                    <div className="flex gap-16 mt-4 mr-6 items-stretch text-sm">
                      <p className="text-gray-500 font-medium">Services</p>
                      <ul className="flex flex-col gap-2">
                        <li>
                          <p className="flex items-center gap-3">
                            <span className="text-blue-500">
                              <VerifiedUserIcon
                                sx={{
                                  fontSize: "18px",
                                }}
                              />
                            </span>{" "}
                            {product?.warranty} Year Brand Warranty
                          </p>
                        </li>
                        <li>
                          <p className="flex items-center gap-3">
                            <span className="text-blue-500">
                              <CachedIcon
                                sx={{
                                  fontSize: "18px",
                                }}
                              />
                            </span>{" "}
                            7 Days Replacement Policy
                          </p>
                        </li>
                        <li>
                          <p className="flex items-center gap-3">
                            <span className="text-blue-500">
                              <CurrencyRupeeIcon
                                sx={{
                                  fontSize: "18px",
                                }}
                              />
                            </span>{" "}
                            Cash on Delivery available
                          </p>
                        </li>
                      </ul>
                    </div>
                    {/* <!-- services details --> */}
                  </div>
                  {/* <!-- highlights & services details --> */}

                  {/* <!-- seller details --> */}
                  <div className="flex gap-16 mt-4 items-center text-sm font-medium">
                    <p className="text-gray-500">Seller</p>
                    <Link className="font-medium text-blue-500 ml-3" to="/">
                      {product?.brand?.name}
                    </Link>
                  </div>
                  {/* <!-- seller details --> */}

                  {/* <!-- flipkart plus banner --> */}
                  {/* <div className="lg:w-1/2 mt-4 border border-gray-300">
                                        <img
                                            draggable="false"
                                            className="w-full h-full object-fill"
                                            src="https://rukminim1.flixcart.com/lockin/763/305/images/promotion_banner_v2_active.png"
                                            alt="flipkart plus"
                                        />
                                    </div> */}
                  {/* <!-- flipkart plus banner --> */}

                  {/* <!-- description details --> */}
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-14 mt-4 items-stretch text-sm">
                    <p className="text-gray-500 font-medium">Description</p>
                    <span>{product?.description}</span>
                  </div>
                  {/* <!-- description details --> */}

                  {/* <!-- specifications border box --> */}
                  <div className="w-full mt-4 pb-4 rounded-sm border border-gray-300 flex flex-col">
                    <h1 className="px-6 py-4 border-b border-gray-300 text-2xl font-[600]">
                      Specifications
                    </h1>
                    <h1 className="px-6 py-3 text-lg">General</h1>

                    {/* <!-- specs list --> */}
                    {product?.specifications?.map((spec, i) => (
                      <div
                        className="px-6 py-2 flex items-center text-sm"
                        key={i}
                      >
                        <p className="text-gray-500 w-3/12">{spec.title}</p>
                        <p className="flex-1">{spec.description}</p>
                      </div>
                    ))}
                    {/* <!-- specs list --> */}
                  </div>
                  {/* <!-- specifications border box --> */}

                  {/* <!-- reviews border box --> */}
                  <div className="w-full mt-4 rounded-sm border border-gray-300 flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-300 px-6 py-4">
                      <h1 className="text-2xl font-medium">
                        Ratings & Reviews
                      </h1>
                      <button
                        onClick={handleDialogClose}
                        className="shadow bg-white font-[500] px-4 py-2 rounded-sm hover:shadow-md border border-gray-300"
                      >
                        Rate Product
                      </button>
                    </div>

                    <Dialog
                      aria-labelledby="review-dialog"
                      open={open}
                      onClose={handleDialogClose}
                    >
                      <DialogTitle className="border-b border-gray-300">
                        Submit Review
                      </DialogTitle>
                      <DialogContent className="flex flex-col m-1 gap-4">
                        <Rating
                          onChange={(e) => setRating(e.target.value)}
                          value={rating}
                          size="large"
                          precision={0.5}
                        />
                        <TextField
                          label="Review"
                          multiline
                          rows={3}
                          sx={{ width: 400 }}
                          size="small"
                          variant="outlined"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </DialogContent>
                      <DialogActions>
                        <button
                          onClick={handleDialogClose}
                          className="py-2 px-6 rounded shadow bg-white border border-red-500 hover:bg-red-100 text-red-600 uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={reviewSubmitHandler}
                          className="py-2 px-6 rounded bg-[#FB641B] hover:bg-[#ff7f54] text-white shadow uppercase"
                        >
                          Submit
                        </button>
                      </DialogActions>
                    </Dialog>

                    <div className="flex items-center border-b border-gray-300">
                      <h1 className="px-6 py-3 text-3xl font-semibold">
                        {product?.ratings?.toFixed(1)} <StarIcon />
                      </h1>
                      <p className="text-lg text-gray-500">
                        ({product?.numOfReviews}) Reviews
                      </p>
                    </div>

                    {viewAll
                      ? reviews?.reviews
                          ?.map((rev, i) => (
                            <div
                              className="flex flex-col gap-2 py-4 px-6 border-b border-gray-300"
                              key={i}
                            >
                              <Rating
                                name="read-only"
                                value={rev.rating}
                                readOnly
                                size="small"
                                precision={0.5}
                              />
                              <p>{rev.comment}</p>
                              <span className="text-sm text-gray-500">
                                by {rev.user.fname + " " + rev.user.lname}
                              </span>
                            </div>
                          ))
                          .reverse()
                      : reviews?.reviews
                          ?.slice(-3)
                          .map((rev, i) => (
                            <div
                              className="flex flex-col gap-2 py-4 px-6 border-b border-gray-300"
                              key={i}
                            >
                              <Rating
                                name="read-only"
                                value={rev.rating}
                                readOnly
                                size="small"
                                precision={0.5}
                              />
                              <p>{rev.comment}</p>
                              <span className="text-sm text-gray-500">
                                by {rev.user.fname + " " + rev.user.lname}
                              </span>
                            </div>
                          ))
                          .reverse()}
                    {reviews?.reviews?.length > 3 && (
                      <button
                        onClick={() => setViewAll(!viewAll)}
                        className="w-1/3 m-2 rounded-sm shadow hover:shadow-lg py-2 bg-blue-500 text-white"
                      >
                        {viewAll ? "View Less" : "View All"}
                      </button>
                    )}
                  </div>
                  {/* <!-- reviews border box --> */}
                </div>
              </section>
              {/* <!-- product desc wrapper --> */}
            </div>
            {/* <!-- product image & description container end --> */}

            {/* Sliders */}
            <div className="flex flex-col gap-3 mt-6">
              <ProductSlider
                title={"Recommendation"}
                products={[...fashionProducts, ...electronicProducts]}
              />
            </div>
          </main>
        </>
      )}
    </>
  );
};

export default ProductDetails;

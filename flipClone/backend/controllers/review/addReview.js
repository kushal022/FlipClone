import { createError } from "../../middleware/errorHandler.js";
import reviewModel from "../../models/reviewModel.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";


// ADD REVIEW CONTROLLER
export const addReviewController = async (req, res, next) => {
  try {
    const user = req.user; // comes from requireSignIn middleware
    const { rating, comment, productId } = req.body;

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return response(res, 404, {
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await reviewModel.findOne({
      product: productId,
      user: user._id,
    });

    if (existingReview) {
      return response(res, 400, {
        success: false,
        message: "You already reviewed this product",
      });
    }

    // Create review
    const newReview = new reviewModel({
      product: productId,
      user: user._id,
      rating,
      comment,
    });

    await newReview.save();

    // Update product ratings & numOfReviews
    const reviews = await reviewModel.find({ product: productId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    product.ratings = avgRating;
    product.numOfReviews = reviews.length;
    await product.save();

    return response(res, 200, {
      success: true,
      data: newReview,
      message: "Your review was added successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error in add review"));
  }
};

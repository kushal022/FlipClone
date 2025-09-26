import { createError } from "../../middleware/errorHandler.js";
import reviewModel from "../../models/reviewModel.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";

// GET REVIEWS CONTROLLER
export const getReviewsController = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return response(res, 404, {
        success: false,
        message: "Product not found",
      });
    }

    // pagination skip
    const skip = (page - 1) * limit;

    // fetch reviews
    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "fname lname email") 
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(parseInt(limit));

    // total reviews
    const totalReviews = await reviewModel.countDocuments({ product: productId });

    return response(res, 200, {
      success: true,
      data: {
        reviews,
        totalReviews,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
      },
      message: "Reviews fetched successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error in get reviews"));
  }
};

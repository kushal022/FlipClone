import { createError } from "../../middleware/errorHandler.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";

// Get Seller Products Controller:
const getSellerProducts = async (req, res, next) => {
    try {
        const products = await productModel.find({ seller: req.user._id });
        if (!products) {
            return response(res, 404, {
                success: false,
                message: "No Products Found!",
                errorType: "productNotFound",
            });
        }
        return response(res, 200, { 
            success: true, 
            message: "Get all seller's Product success",
            data:products,
         });
    } catch (error) {
        next(createError(500, error, "Error in getting all seller's products"))
    }
};

export default getSellerProducts;

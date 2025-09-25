import { createError } from "../../middleware/errorHandler.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";

// Find Product Controller:
const findProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;

        const product = await productModel.findById(productId).populate("seller");
        // if no product -? product don't exist
        !product &&
            response(res, 404, {
                success: false,
                errorType: "productNotFound",
                message: "Product Not Found",
            });
        product &&
            response(res, 201, {
                success: true,
                message: "Product Fetched Successfully",
                data: product,
            });
    } catch (error) {
        next(createError(500, error, "Error in Finding Product"))
    }
};
export default findProduct;

import { createError } from "../../middleware/errorHandler.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";

// Search Product Controller:
const searchProductController = async (req, res, next) => {
    try {
        const { keyword } = req.params;
        console.log(keyword); 

        // MongoDB's $regex operator for a case-insensitive search
        const products = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        });
        console.log('products: ', products)
        return response(res, 200, {
            success: true,
            data: products,
            message: "Product find successfully", 
        });
    } catch (error) {
        next(createError(500, error, "Error in Searching Products"))
    }
};
export default searchProductController;

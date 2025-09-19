import { createError } from "../../middleware/errorHandler.js";
import productModel from "../../models/productModel.js";
import { response } from "../../utils/response.js";

// Get Filtered Products Controller:
const getFilteredProducts = async (req, res, next) => {
    try {
        // Extract parameters from the request query
        const { category, priceRange, ratings } = req.query;

        let products = await productModel.find({}).sort({ createdAt: -1 });
        if (category) {
            products = products.filter(
                (product) => product.category === category
            );
        }

        if (priceRange && priceRange.length === 2) {
            const [minPrice, maxPrice] = priceRange;
            products = products.filter(
                (product) =>
                    product.price >= minPrice && product.price <= maxPrice
            );
        }

        if (ratings) {
            const minRatings = Number(ratings);
            products = products.filter(
                (product) => product.ratings >= minRatings
            );
        }

        if (!products) {
            return response(res, 404,{
                success: false,
                message: "No Products Found!",
                errorType: "productNotFound",
            });
        }
        return response(res, 200, { success: true, products });
    } catch (error) {
        next(createError(500, error, "Error in getting Filtered Products"))
    }
};

export default getFilteredProducts;

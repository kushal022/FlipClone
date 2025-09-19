import productModel from "../../models/productModel.js";
import userModel from "../../models/userModel.js";
import orderModel from "../../models/orderModel.js"; 
import { response } from "../../utils/response.js";

// Delete Product Controller:
const deleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.body;

        // Step 1: Delete the product from the product model
        const product = await productModel.findByIdAndDelete(productId);

        if (!product) {
            return response(res, 401, {
                success: false,
                errorType: "productNotFound",
                message: "Product Not Found",
            });
        }

        // Step 2: Remove the product from all users' wishlists
        await userModel.updateMany(
            { wishlist: productId }, // Find users with this product in their wishlist
            { $pull: { wishlist: productId } } // Pull the product out of the wishlist array
        );

        // Step 3: Remove the product from order history (if applicable)
        await orderModel.updateMany(
            { "products.productId": productId }, // Find orders containing this product
            { $pull: { products: { productId } } } // Pull the product from the products array
        );

        // Step 4: Send success response
        return response(res, 201, {
            success: true,
            message:
                "Product Deleted Successfully and removed from wishlists and order history",
        });
    } catch (error) {
        next(createError(500, error, "Error in Deleting Product"))
    }
};

export default deleteProduct;

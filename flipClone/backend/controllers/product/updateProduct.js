import productModel from "../../models/productModel.js";
import cloudinary from "cloudinary";
import { response } from "../../utils/response.js";
import { createError } from "../../middleware/errorHandler.js";

// Update Product Controller: 
const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);

        if (!product) {
            return response(res, 404, {
                success: false,
                message: "No Product Found",
                errorType: "productNotFound",
            });
        }

        // Handle removed images
        let publicIdToDelete = req.body.removedImages; // for cloudinary id
        if (typeof publicIdToDelete === "string") {
            await cloudinary.v2.uploader.destroy(publicIdToDelete);
        } else if (
            Array.isArray(publicIdToDelete) &&
            publicIdToDelete.length > 0
        ) {
            await Promise.all(
                publicIdToDelete.map((id) => cloudinary.v2.uploader.destroy(id))
            );
        }

        // Handle images upload
        let imagesLink = [];
        const images = Array.isArray(req.body.images)
            ? req.body.images
            : req.body.images
            ? [req.body.images]
            : []; // Default to an empty array if no images are provided

        if (images && images.length > 0) {
            for (const image of images) {
                const result = await cloudinary.v2.uploader.upload(image, {
                    folder: "products",
                });
                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        }

        // Update brand logo
        let brandLogo = null;
        const oldLogo = req.body.oldLogo ? JSON.parse(req.body.oldLogo) : null;
        if (req.body.logo && req.body.logo !== "null") {
            const result = await cloudinary.v2.uploader.upload(req.body.logo, {
                folder: "brands",
            });
            brandLogo = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        // Update product fields
        product.brand = {
            name: req.body.brandName,
            logo: brandLogo || oldLogo,
        };

        // Preserve existing images and append new ones
        const oldImages = req.body.oldImages
            ? JSON.parse(req.body.oldImages)
            : [];
        product.images = [...oldImages, ...imagesLink];

        // Update other product fields
        product.name = req.body.name || product.name;
        product.warranty = req.body.warranty || product.warranty;
        product.stock = req.body.stock || product.stock;
        product.category = req.body.category || product.category;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.discountPrice = req.body.discountPrice || product.discountPrice;
        product.ratings = req.body.ratings || product.ratings;
        product.highlights = req.body.highlights || product.highlights;

        // Update specifications
        if (Array.isArray(req.body.specifications)) {
            product.specifications = req.body.specifications.map((s) =>
                JSON.parse(s)
            );
        }

        // Save the updated product
        const updatedProduct = await product.save();
        return response(res, 201, {
            success: true,
            data: updatedProduct,
            message: "Product Updated Successfully"
        });
    } catch (error) {
        next(createError(500, error, "Error in Updating Product"))
    }
};

export default updateProduct;

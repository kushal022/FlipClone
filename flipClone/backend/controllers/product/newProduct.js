import productModel from "../../models/productModel.js";
import cloudinary from "cloudinary";
import { response } from "../../utils/response.js";
import { createError } from "../../middleware/errorHandler.js";
 
// New Product Controller:
const newProduct = async (req, res, next ) => {
    console.log('new Product add req: --', req.body); 
    try {
        // Handle Images:
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLink = [];

        for (let i = 0; i < images?.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLink;

        // Handle Brand:
        req.body.logo
        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        req.body.brand = {
            name: req.body.brandName,
            logo: brandLogo,
        };

        // Seller:
        req.body.seller = req.user._id;

        // Handle Specifications:
        let specs = [];
        req.body.specifications.forEach((s) => {
            specs.push(JSON.parse(s));
        });
        req.body.specifications = specs;

        // Handle Create new product:
        const product = await productModel.create(req.body);

        return response(res, 201, {
            success: true,
            data:product,
            message: "Product added successfully"
        });
    } catch (error) {
        next(createError(500, error, "Error in adding New Product"))
    }
};

export default newProduct;

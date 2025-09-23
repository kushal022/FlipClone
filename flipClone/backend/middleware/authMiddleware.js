import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";
import { response } from "../utils/response.js";
import { createError } from "./errorHandler.js";

const requireSignIn = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return response(res, 401, { success: false, message: "Token must be provided"})
        }

        // Verify Token | ACCESS TOKEN
        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        // Attach user information to the request
        req.user = await UserModel.findById(decoded._id);

        if (!req.user || req.user.role !== 'customer') {
            return response(res, 401, { success: false, message: "Unauthorized User"})
        }
        next();
    } catch (error) {
        next(createError(500, error, "Server Error in User Auth"))
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
         if (!token) {
            return response(res, 401, { success: false, message: "Token must be provided"})
        }

        // Verify Token | ACCESS TOKEN
        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if( !decoded ) {
            return response(res, 401, {
                success: false,
                message: "Invalid or expired token"
            })
        }

        // Attach user information to the request
        req.user = await UserModel.findById(decoded._id);
        // console.log(req.user);

        if (!req.user || req.user.role !== 'admin') { // admin = 1;
            return response(res, 403, {
                success: false,
                message: "Access denied. Admin privileges required." ,
            })
        }
        next();
    } catch (error) {
        next(createError(500, error, "Server Error in Admin Auth"))
    }
});



export { requireSignIn, isAdmin };
// import JWT from "jsonwebtoken";
// import userModel from "../models/userModel.js";
// import asyncHandler from "express-async-handler";

// //Protected routes token based
// export const requireSignIn = asyncHandler(async (req, res, next) => {
//     try {
//         const token = req.headers?.authorization;
//         // console.log(token);
//         if (!token) {
//             return res.status(401).send({
//                 success: false,
//                 message: "JWT must be provided",
//                 ok: false,
//             });
//         }
//         const decode = JWT.verify(token, process.env.JWT_SECRET);
//         // Set the user information given in token payload
//         req.user = decode;
//         next();
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             message: "Invalid JWT",
//         });
//     }
// });

// //ADMIN access
// export const isAdmin = asyncHandler(async (req, res, next) => {
//     try {
//         const user = await userModel.findById(req.user._id);
//         if (user.role !== 1) {
//             return res.status(401).send({
//                 success: false,
//                 message: "User is not Admin",
//                 ok: false,
//             });
//         }
//         next();
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             error,
//             message: "Error in admin middleware",
//         });
//     }
// });

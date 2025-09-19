import { createError } from "../../middleware/errorHandler.js";
import userModel from "../../models/userModel.js";
import { hashPassword } from "../../utils/auth.js";
import { response } from "../../utils/response.js";

// POST Forgot Password
export const forgotPasswordController = async (req, res, next ) => {
    try {
        const { email, password } = req.body;

        //Checking the EMAIL and PASSWORD
        if (!email || !password) {
            return response(res, 401, {
                success: false,
                message: "Invalid username or password",
                errorType: "invalidCredentials",
            });
        }

        //FINDING THE USER
        const user = await userModel.findOne({ email });

        if (!user) {
            return response(res, 401, {
                success: false,
                message: "User Not Registered!",
                errorType: "invalidUser",
            });
        }
        const newPassword = await hashPassword(password);

        //IF USER EXISTS-
        const updatePassword = await userModel.findOneAndUpdate(
            { email: email },
            {
                password: newPassword,
            }
        );

        //SUCCESS RESPONSE
        return response(res, 200, {
            success: true,
            message: "Password Reset Successfully!",
            // response,
        });
    } catch (error) {
        next(createError(500,error, "Error in Forgot Password"))
        // console.log("Forgot Password Error: " + error);
        // res.status(500).send({
        //     success: false,
        //     message: "Error in Forgot Password",
        //     error,
        // });
    }
};

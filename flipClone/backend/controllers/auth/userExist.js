import { createError } from "../../middleware/errorHandler.js";
import userModel from "../../models/userModel.js";
import { response } from "../../utils/response.js";

//USER EXIST
export const userCheckController = async (req, res, next) => {
    try {
        const { email } = req.body;

        //Checking the EMAIL and PASSWORD
        if (!email) {
            return response(res, 401,{
                success: false,
                message: "Invalid username",
                errorType: "invalidCredentials",
            });
        }

        //FINDING THE USER
        const user = await userModel.findOne({ email });

        if (!user) {
            return response(res, 401,{
                success: false,
                message: "User Not Registered!",
                errorType: "invalidUser",
            });
        }

        //SUCCESS RESPONSE
        return response(res, 200, {
            success: true,
            message: "User Found!",
        });
    } catch (error) {
        next(createError(500, error, "Error in user checking"))
    }
};

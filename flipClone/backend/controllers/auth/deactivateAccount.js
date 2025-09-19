import { createError } from "../../middleware/errorHandler.js";
import userModel from "../../models/userModel.js";

//account Deactivate
export const deactivateController = async (req, res, next) => {
    try {
        const { email, phone } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return response(res, 401, {
                success: false,
                message: "User Not Found!",
                errorType: "invalidUser",
            });
        };

        phone === user.phone && (await userModel.deleteOne({ email: email }))
            ?  response(res, 200, {
                  success: true,
                  message: "Account Deleted Successfully!",
              })
            : response(res, 401, {
                  success: true,
                  message: "Mobile Number does not match!",
                  errorType: "phoneMismatch",
              });
    } catch (error) {
        next(createError(500, error, "Error in Deactivate Account"))
    }
};

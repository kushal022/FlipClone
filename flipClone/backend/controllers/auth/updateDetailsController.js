import { createError } from "../../middleware/errorHandler.js";
import userModel from "../../models/userModel.js";
import { response } from "../../utils/response.js";

// Update Details controller
export const updateDetailsController = async (req, res, next) => {
    try {
        const { newFname, newEmail, newPhone, email } = req.body;

        // find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return response(res, 401, {
                success: false,
                message: "User Not Found!",
                errorType: "invalidUser",
            });
        }

        //update user's name
        if (newFname) {
            const update = await userModel.findOneAndUpdate(
                { email: email },{fname: newFname,}
            );
            response(res, 200, {
                success: true,
                message: "Name Updated Successfully!",
            });
        }
        if (newEmail) {
            const update = await userModel.findOneAndUpdate(
                { email: email },{email: newEmail}
            );
            response(res, 200, {
                success: true,
                message: "Email Updated Successfully!",
            });
        }
        if (newPhone) {
            const update = await userModel.findOneAndUpdate(
                { email: email },{phone: newPhone,}
            );
            response(res, 200, {
                success: true,
                message: "Mobile Number Updated Successfully!",
            });
        }

    } catch (error) {
        next(createError(500, error, "Error in Updating Details"))
    }
};

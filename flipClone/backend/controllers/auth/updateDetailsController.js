import { createError } from "../../middleware/errorHandler.js";
import userModel from "../../models/userModel.js";
import { response } from "../../utils/response.js";

// Update Details controller
export const updateDetailsController = async (req, res, next) => {
    try {
        const { newFname, newLname, newEmail, newPhone, email } = req.body;

        // find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return response(res, 404, {
                success: false,
                message: "User Not Found!",
                errorType: "invalidUser",
            });
        }

        //update user's name
        if (newFname && newLname) {
            console.log( newFname, newLname)
            const update = await userModel.findOneAndUpdate(
                { email: email },
                {fname: newFname,lname: newLname},
                {new: true})
                .select("-password")
            
            return response(res, 200, {
                success: true,
                data: update,
                message: "Name Updated Successfully!",
            });
        }
        

        if (newEmail) {
            const update = await userModel.findOneAndUpdate(
                { email: email },
                {email: newEmail},
                {new: true}
            ).select("-password");
            return response(res, 200, {
                success: true,
                data: update,
                message: "Email Updated Successfully!",
            });
        }
        if (newPhone) {
            const update = await userModel.findOneAndUpdate(
                { email: email },
                {phone: newPhone,},
                {new: true}
            ).select("-password");
            return response(res, 200, {
                success: true,
                data: update,
                message: "Mobile Number Updated Successfully!",
            });
        }

        return response(res, 400, {
            success: false,
            message: "No details to update",
            errorType: "noDetails"
        })

    } catch (error) {
        next(createError(500, error, "Error in Updating Details"))
    }
};

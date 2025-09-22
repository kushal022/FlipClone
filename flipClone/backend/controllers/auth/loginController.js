import { comparePassword } from "../../utils/auth.js";
import { response } from "../../utils/response.js";
import userModel from "../../models/userModel.js";
import JWT from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import { createError } from "../../middleware/errorHandler.js";

//POST LOGIN
export const loginController = async (req, res, next) => {
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

        //IF USER EXISTS-CHECKING THE PASSWORD
        const match = await comparePassword(password, user.password);
        if (!match) {
            return response(res, 401, {
                success: false,
                message: "Invalid Password!",
                errorType: "invalidPassword",
            });
        }

        //TOKEN
        
        const payload = { _id: user._id }
        const accessToken = await generateAccessToken(payload, '1h'); // ShortTerm
        const refreshToken = await generateRefreshToken(payload); // longTerm

        user.refreshToken = refreshToken;
        await user.save();

        //SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            message: "Logged in Successfully!",
            accessToken,
            data: {
                _id: user._id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                phone: user.phone,
                address: user.addresses,
                role: user.role,
            },
        });
    } catch (error) {
        next(createError(500,error, '‼️Error in Login'))
    }
};

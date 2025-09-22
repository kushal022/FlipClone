import { hashPassword } from '../../utils/auth.js';
import { response } from '../../utils/response.js';
import userModel from "../../models/userModel.js";
import { createError } from '../../middleware/errorHandler.js';

export const registerController = async (req, res, next) => {
  try {
    const { fname, lname, email, phone, password, address, role } = req.body;
    console.log(req.body);
    // ✅ Validations
    if (!fname) return response(res, 400, {success: false, message: "Name is required", errorType: "Invalid Credential"});
    if (!email) return response(res, 400, {success: false, message: "Email is required", errorType: "Invalid Credential"});
    if (!password) return response(res, 400, {success: false, message: "Password is required", errorType: "Invalid Credential"}); 
    if (!phone) return response(res, 400, {success: false, message: "Phone number is required", errorType: "Invalid Credential"});
    if (!address)
      return response(res, 400, {success: false, message: "Address is required", errorType: "Invalid Credential"});
    
    // if (!name) return next(createError(400, "Name is required"));
    // if (!email) return next(createError(400, "Email is required"));
    // if (!password) return next(createError(400, "Password is required"));
    // if (!phone) return next(createError(400, "Phone number is required"));
    // if (!Array.isArray(addresses) || addresses.length === 0)
    //   return next(createError(400, "At least one address is required"));



    // ✅ Check for existing users
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return response(res, 409, {
        success: false,
        message: "Email already registered!",
        errorType: "emailConflict",
      });
    }

    // ✅ Hash password
    const hashedPassword = await hashPassword(password);

    // ✅ Create user
    const user = new userModel({
      fname,
      lname,
      email,
      phone,
      password: hashedPassword,
      addresses: address,
      role,
    });

    await user.save();

    // ✅ Remove password before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log(`New User ${fname} ${lname} is Registered`);
    return response(res, 201, {
      success: true,
      message: "User registered successfully!",
      data: userResponse,
    });
  } catch (error) {
    next(createError(500, error.message || "❗ Error in Registration"));
  }
};

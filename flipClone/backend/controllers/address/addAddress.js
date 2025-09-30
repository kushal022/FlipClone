import Address from "../../models/addressModel.js";
import { createError } from "../../middleware/errorHandler.js";
import { response } from "../../utils/response.js";

//* Add new address Controller
export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, street, city, state, country, pincode, landmark, isDefault, addressType } = req.body;
    // console.log(req.body)
    // if address marked default, remove previous default
    if (isDefault) {
      await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    }

    const newAddress = await Address.create({
      user: userId,
      fullName,
      phone,
      street,
      city,
      state,
      country,
      pincode,
      landmark,
      isDefault,
      addressType,
    });

    return response(res, 201, {
      success: true,
      data: newAddress,
      message: "Address added successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error while adding address"));
  }
};

// Get all addresses for logged-in user
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const addresses = await Address.find({ user: userId });

    return response(res, 200, {
      success: true,
      data: addresses,
      message: "Addresses fetched successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error while fetching addresses"));
  }
};

//  Update address
export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // address id

    // if making default, reset others
    if (req.body.isDefault) {
      await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedAddress) {
      return next(createError(404, "Address not found"));
    }

    return response(res, 200, {
      success: true,
      data: updatedAddress,
      message: "Address updated successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error while updating address"));
  }
};

//  Delete address
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deletedAddress = await Address.findOneAndDelete({ _id: id, user: userId });

    if (!deletedAddress) {
      return next(createError(404, "Address not found"));
    }

    return response(res, 200, {
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(createError(500, error, "Error while deleting address"));
  }
};

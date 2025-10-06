import CartModel from "../models/cartModel.js";
import { response } from "../utils/response.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { createError } from "../middleware/errorHandler.js";

// Utility functions
export const calculateCartTotals = (items) => {
  return items.reduce(
    (totals, item) => {
      totals.totalPrice += item.price * item.quantity;
      totals.totalDiscountPrice += item.discountPrice * item.quantity;
      totals.totalItems += item.quantity;
      return totals;
    },
    { totalPrice: 0, totalDiscountPrice: 0, totalItems: 0 }
  );
};

export const validateProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid Product ID");
  }

  const product = await productModel
    .findById(productId)
    .select("name price stock brandName seller discountPrice images")
    .lean();
  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < 1) {
    throw new Error("Product out of stock");
  }

  return product;
};

export const getOrCreateCart = async (userId) => {
  let cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    cart = new CartModel({
      user: userId,
      items: [],
      totalPrice: 0,
      totalDiscountPrice: 0,
      totalItems: 0,
    });
  }

  return cart;
};







// Add to cart controller (Enhanced)
 const addToCartController = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { productId, quantity = 1, saveForLater = false } = req.body;

    // Validate input
    if (!productId) {
      await session.abortTransaction();
      return response(res, 400, {
        success: false,
        message: "Product ID is required",
        errorType: "validationError"
      });
    }

    // Validate and get product
    const product = await validateProduct(productId);
    
    // Get or create cart
    const cart = await getOrCreateCart(userId);
    
    // Find existing item in cart
    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    const itemData = {
      productId,
      name: product.name,
      price: product.price,
      stock: product.stock,
      brandName: product.brandName,
      seller: product.seller,
      discountPrice: product.discountPrice,
      quantity: quantity,
      image: product.images?.[0]?.url || '',
      saveForLater
    };

    if (itemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      // Check stock availability
      if (newQuantity > product.stock) {
        await session.abortTransaction();
        return response(res, 400, {
          success: false,
          message: `Only ${product.stock} items available in stock`,
          errorType: "insufficientStock"
        });
      }

      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].saveForLater = saveForLater;
    } else {
      // Check stock availability for new item
      if (quantity > product.stock) {
        await session.abortTransaction();
        return response(res, 400, {
          success: false,
          message: `Only ${product.stock} items available in stock`,
          errorType: "insufficientStock"
        });
      }

      // Add new item
      cart.items.push(itemData);
    }

    // Recalculate totals
    const totals = calculateCartTotals(cart.items);
    cart.totalPrice = totals.totalPrice;
    cart.totalDiscountPrice = totals.totalDiscountPrice;
    cart.totalItems = totals.totalItems;

    await cart.save({ session });
    await session.commitTransaction();

    // Populate cart data for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate('items.productId', 'name images price discountPrice stock')
      .lean();

    return response(res, 200, {
      success: true,
      message: itemIndex > -1 ? "Cart updated successfully" : "Item added to cart successfully",
      data: populatedCart
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.message === "Invalid Product ID") {
      return response(res, 400, {
        success: false,
        message: "Invalid Product ID",
        errorType: "invalidProductId"
      });
    }
    
    if (error.message === "Product not found") {
      return response(res, 404, {
        success: false,
        message: "Product not found",
        errorType: "notFound"
      });
    }

    if (error.message === "Product out of stock") {
      return response(res, 400, {
        success: false,
        message: "Product is out of stock",
        errorType: "outOfStock"
      });
    }

    next(createError(500, error.message || "Error in adding to cart!"));
  } finally {
    session.endSession();
  }
};

// Decrease quantity controller (Enhanced)
const decQuantityController = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      await session.abortTransaction();
      return response(res, 400, {
        success: false,
        message: "Product ID is required",
        errorType: "validationError"
      });
    }

    // Validate product
    await validateProduct(productId);

    // Find cart
    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      await session.abortTransaction();
      return response(res, 404, {
        success: false,
        message: "Cart not found",
        errorType: "notFound"
      });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      await session.abortTransaction();
      return response(res, 404, {
        success: false,
        message: "Item not found in cart",
        errorType: "notFound"
      });
    }

    const item = cart.items[itemIndex];
    const newQuantity = Math.max(0, item.quantity - quantity);

    if (newQuantity === 0) {
      // Remove item if quantity becomes 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = newQuantity;
    }

    // Recalculate totals
    const totals = calculateCartTotals(cart.items);
    cart.totalPrice = totals.totalPrice;
    cart.totalDiscountPrice = totals.totalDiscountPrice;
    cart.totalItems = totals.totalItems;

    await cart.save({ session });
    await session.commitTransaction();

    const populatedCart = await CartModel.findById(cart._id)
      .populate('items.productId', 'name images price discountPrice stock')
      .lean();

    return response(res, 200, {
      success: true,
      message: newQuantity === 0 ? "Item removed from cart" : "Cart item quantity decreased",
      data: populatedCart
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.message === "Invalid Product ID") {
      return response(res, 400, {
        success: false,
        message: "Invalid Product ID",
        errorType: "invalidProductId"
      });
    }

    next(createError(500, error.message || "Error in decreasing cart item quantity!"));
  } finally {
    session.endSession();
  }
};

// Remove item from cart controller (Enhanced)
const removeFromCartController = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      await session.abortTransaction();
      return response(res, 400, {
        success: false,
        message: "Product ID is required",
        errorType: "validationError"
      });
    }

    // Find cart
    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      await session.abortTransaction();
      return response(res, 404, {
        success: false,
        message: "Cart not found",
        errorType: "notFound"
      });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      await session.abortTransaction();
      return response(res, 404, {
        success: false,
        message: "Item not found in cart",
        errorType: "notFound"
      });
    }

    // Remove item
    const removedItem = cart.items.splice(itemIndex, 1)[0];

    // Recalculate totals
    const totals = calculateCartTotals(cart.items);
    cart.totalPrice = totals.totalPrice;
    cart.totalDiscountPrice = totals.totalDiscountPrice;
    cart.totalItems = totals.totalItems;

    await cart.save({ session });
    await session.commitTransaction();

    const populatedCart = await CartModel.findById(cart._id)
      .populate('items.productId', 'name images price discountPrice stock')
      .lean();

    return response(res, 200, {
      success: true,
      message: 'Item removed from cart successfully',
      data: populatedCart,
      removedItem: {
        productId: removedItem.productId,
        name: removedItem.name,
        quantity: removedItem.quantity
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(createError(500, error.message || "Error in removing item from cart!"));
  } finally {
    session.endSession();
  }
};

// Get cart controller (New)
 const getCartController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await CartModel.findOne({ user: userId })
      .populate('items.productId', 'name images price discountPrice stock category')
      .lean();

    if (!cart) {
      return response(res, 200, {
        success: true,
        message: "Cart is empty",
        data: {
          items: [],
          totalPrice: 0,
          totalDiscountPrice: 0,
          totalItems: 0,
          totalSavings: 0
        }
      });
    }

    // Calculate savings and add additional info
    const cartWithSavings = {
      ...cart,
      totalSavings: cart.totalPrice - cart.totalDiscountPrice,
      items: cart.items.map(item => ({
        ...item,
        itemTotal: item.discountPrice * item.quantity,
        itemSavings: (item.price - item.discountPrice) * item.quantity,
        inStock: item.productId.stock >= item.quantity
      }))
    };

    return response(res, 200, {
      success: true,
      message: "Cart retrieved successfully",
      data: cartWithSavings
    });

  } catch (error) {
    next(createError(500, "Error in retrieving cart!"));
  }
};

// Clear cart controller (New)
 const clearCartController = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    const cart = await CartModel.findOne({ user: userId });
    
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return response(res, 200, {
        success: true,
        message: "Cart is already empty",
        data: null
      });
    }

    // Clear all items
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalDiscountPrice = 0;
    cart.totalItems = 0;

    await cart.save({ session });
    await session.commitTransaction();

    return response(res, 200, {
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });

  } catch (error) {
    await session.abortTransaction();
    next(createError(500, "Error in clearing cart!"));
  } finally {
    session.endSession();
  }
};

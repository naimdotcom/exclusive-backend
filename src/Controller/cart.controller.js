const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");
const Cart = require("../Model/cart.model");

const createCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;
    if (!product) {
      return res.status(401).json(new apiError(401, "product not found"));
    }
    // check if product already exist in cart

    const isExistProduct = await Cart.find({ product: product });

    if (isExistProduct.length > 0) {
      return res
        .status(401)
        .json(new apiError(401, "product already exist in cart"));
    }

    const cart = await Cart.create({
      product: product,
      quantity: quantity,
      user: req.user._id,
    });

    if (!cart) {
      return res.status(401).json(new apiError(401, "something went wrong!!"));
    }
    return res.status(200).json(new apiResponse(200, "cart added", cart));
  } catch (error) {
    console.log("error in create cart", error);
    return res
      .status(500)
      .json(new apiError(500, "server error in creating cart"));
  }
};

const getAllCartItemForUser = async (req, res) => {
  try {
    const userCart = await Cart.find({ user: req.user._id })
      .populate({
        path: "user",
        select:
          "-password -isVerified -otp -otpExpirationTime -createdAt -updatedAt",
      })
      .populate({
        path: "product",
      });

    if (!userCart) {
      return res.status(401).json(new apiError(401, "no cart found!!"));
    }
    return res.status(200).json(new apiResponse(200, "cart found.", userCart));
  } catch (error) {
    console.log("error in get all cart for a user", error);
    return res.status(500).json(new apiError(500, "something went wrong"));
  }
};

const deleteUserCart = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCart = await Cart.findByIdAndDelete({ _id: id });

    if (!deletedCart) {
      return res.status(401).json(new apiError(401, `cart not found`));
    }
    return res
      .status(200)
      .json(new apiResponse(200, `cart deleted`, deleteUserCart));
  } catch (error) {
    console.log("error in delete cart for user::", error);
    res.status(500).json(new apiError(500, "something went wrong"));
  }
};

const actionForCart = async (req, res) => {
  try {
    const { action, id } = req.query;
    if (!action || !id) {
      return res.status(404).json(new apiError(401, "cradential invalid"));
    }

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    if (action === "increment") {
      cartItem.quantity += 1;
    } else if (action === "decrement") {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      } else {
        return res
          .status(400)
          .json(new apiError(400, "Quantity cannot be less than 1"));
      }
    } else {
      return res.status(400).json(new apiError(400, "Invalid action"));
    }

    await cartItem.save(); // Save updated quantity
    return res
      .status(200)
      .json(new apiResponse(200, `${action} success`, cartItem));
  } catch (error) {
    console.log("error in action cart", error);
    res.status(500).json(new apiError(500, "something went wrong!!"));
  }
};

module.exports = {
  createCart,
  getAllCartItemForUser,
  deleteUserCart,
  actionForCart,
};

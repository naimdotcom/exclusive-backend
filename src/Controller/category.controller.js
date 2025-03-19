const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");
const categoryModel = require("../Model/category.model");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const { mongoose } = require("mongoose");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.files) {
      return res
        .status(400)
        .json(new apiError(400, "bad request! image is missing", null, null));
    }

    const uploadResult = await uploadImage(req?.files?.image[0]?.path);

    const category = await new categoryModel({
      name: name,
      image: uploadResult.secure_url,
    }).save();

    if (!category) {
      return res
        .status(400)
        .json(new apiError(400, "category not created", null, null));
    }

    res
      .status(200)
      .json(new apiResponse(200, "category created", category, null));
  } catch (error) {
    console.log(`error from creating category: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const getAllCategory = async (req, res) => {
  try {
    const category = await categoryModel
      .find()
      .populate("subCategory product")
      .select("-__v -updatedAt");

    if (!category) {
      return res
        .status(400)
        .json(new apiError(400, "category not found", null, null));
    }

    res
      .status(200)
      .json(new apiResponse(200, "category created", category, null));
  } catch (error) {
    console.log(`error from getting category: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const category = await categoryModel.findById(id);

    if (!category) {
      return res
        .status(400)
        .json(new apiError(400, "category not found", null, null));
    }
    let updateObj = {};

    if (name) {
      updateObj.name = name;
    }

    if (req.files?.image) {
      const path = req.files?.image[0]?.path;

      // todo: remove the old image
      const oldImage =
        category.image.split("/")[category.image.split("/").length - 1];
      const deletedResult = await deleteImage(oldImage);
      if (deletedResult) {
        const { secure_url } = await uploadImage(path);
        updateObj.image = secure_url;
      }

      // todo: remove the old image
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      { _id: id },
      { ...updateObj },
      { new: true }
    );
    if (!updatedCategory) {
      return res
        .status(400)
        .json(new apiError(400, "category not updated", null, null));
    }

    res
      .status(200)
      .json(new apiResponse(200, "category updated", updatedCategory, null));
  } catch (error) {
    console.log(`error from updating category: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const getCategoryByIdOrName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    // Build the query conditionally
    const query = isValidObjectId
      ? { _id: id } // Query by _id or name
      : { name: id }; // Query only by name

    const category = await categoryModel
      .find(query)
      .populate("product subCategory")
      .select("-__v -createdAt -updatedAt");

    if (!category) {
      return res
        .status(400)
        .json(new apiError(400, "category not found", null, null));
    }

    res
      .status(200)
      .json(new apiResponse(200, "category created", category[0], null));
  } catch (error) {
    console.log(`error from  getting single category: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    // Build the query conditionally
    const query = isValidObjectId
      ? { _id: id } // Query by _id or name
      : { name: id }; // Query only by name

    const deletedCategory = await categoryModel.findOneAndDelete(query);
    if (!deletedCategory) {
      return res
        .status(400)
        .json(new apiError(400, "category not deleted", null, null));
    }

    res
      .status(200)
      .json(new apiResponse(200, "category deleted", deletedCategory, null));
  } catch (error) {
    console.log("error from deleting category", error);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  updateCategory,
  getCategoryByIdOrName,
  deleteCategory,
};

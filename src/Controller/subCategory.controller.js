const apiError = require("../utils/ApiError");
const apiResponse = require("../utils/ApiResponse");
const subCategory = require("../Model/subCategory.model");
const category = require("../Model/category.model");

const createSubCategory = async (req, res) => {
  try {
  } catch (error) {
    console.log("error in creating subcategory", error);
    res
      .status("500")
      .json(apiError(500, "creating subcategory error.", {}, error));
  }
};

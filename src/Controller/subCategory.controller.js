const apiError = require("../utils/ApiError");
const apiResponse = require("../utils/ApiResponse");
const SubCategory = require("../Model/subCategory.model");
const Category = require("../Model/category.model");

const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      res
        .status(401)
        .json(new apiError(401, "creadential missing. name or categoryID"));
    }

    // cheack if user exist or not
    const isSubcategoryExist = await SubCategory.find({ name: name });
    if (!isSubcategoryExist) {
      res
        .status(409)
        .json(new apiError(409, "subcategory already exist, try another name"));
    }

    // is category exist or not
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json(new apiError(404, "category not found"));
    }

    // create subcategory in db
    const subcategory = await SubCategory.create({
      name: name,
      category: categoryId,
    });
    if (!subcategory) {
      res.status(500).json(new apiError(500, "error in subcategory creation"));
    }
    // update categories subcategory id'es and save it in DB
    category.subCategory.push(subcategory.id);
    await category.save();

    return res
      .status(200)
      .json(new apiResponse(200, "subcategory created", subcategory));
  } catch (error) {
    console.log("error in creating subcategory", error);
    res
      .status(500)
      .json(new apiError(500, "creating subcategory error.", {}, error));
  }
};

// get all subcategory
const getSubcategory = async (req, res) => {
  try {
    // get all subcategories from db
    const subcategory = (await SubCategory.find().select("-__v")).populate();

    // is subcategory retrive successfull?
    if (!subcategory) {
      res
        .status(400)
        .json(new apiError(400, "something went wrong in subcategory "));
    }

    return res.status(200).json(new apiResponse(200, "success", subcategory));
  } catch (error) {
    console.log("error in getSubcategory:", error);
    res
      .status(500)
      .json(new apiError(500, "error while getting subcategory: ", error));
  }
};

const getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // get subcategory By id
    const subcategory = await SubCategory.findById(id)
      .select("-__v")
      .populate();

    return res
      .status(200)
      .json(new apiResponse(200, "successfully got subcategory", subcategory));
  } catch (error) {
    console.log("error while getting subcategory via ID", error);
    res
      .status(500)
      .json(
        new apiError(500, "something went wrong while getting subcategory")
      );
  }
};

module.exports = {
  createSubCategory,
  getSubcategory,
  getSubcategoryById,
};

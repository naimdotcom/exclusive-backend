const apiError = require("../utils/ApiError");
const apiResponse = require("../utils/ApiResponse");
const SubCategory = require("../Model/subCategory.model");
const Category = require("../Model/category.model");

const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res
        .status(401)
        .json(new apiError(401, "creadential missing. name or categoryID"));
    }
    const capName = name.charAt(0).toUpperCase() + name.slice(1);

    // cheack if user exist or not
    const isSubcategoryExist = await SubCategory.find({ name: capName });
    if (!isSubcategoryExist || isSubcategoryExist.length > 0) {
      res
        .status(409)
        .json(new apiError(409, "subcategory already exist, try another name"));
      return;
    }

    // is category exist or not
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json(new apiError(404, "category not found"));
    }

    // create subcategory in db
    const subcategory = await SubCategory.create({
      name: capName,
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
    const subcategory = await SubCategory.find()
      .populate("category", "-__v")
      .select("-__v");

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
      .populate("category", "-__v")
      .select("-__v");

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

const subcategoryUpdate = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const { id } = req.params;
    if (!name && !categoryId) {
      return res
        .status(400)
        .json(
          new apiError(400, "creadential missing, name or category id or both")
        );
    }

    const subcategory = await SubCategory.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        ...(name && { name: name }),
        ...(categoryId && { category: categoryId }),
      },
      {
        new: true,
      }
    );

    if (!subcategory) {
      return res.status(404).json(new apiError(404, "subcategory not found"));
    }

    return res
      .status(202)
      .json(new apiResponse(202, "updated successfully", subcategory));
  } catch (error) {
    console.log("error while getting subcategory via ID", error);
    res
      .status(500)
      .json(
        new apiError(500, "something went wrong while getting subcategory")
      );
  }
};

const subcategoryDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteSubcategory = await SubCategory.findByIdAndDelete(id);
    if (!deleteSubcategory) {
      return res
        .status(500)
        .json(new apiError(500, `delete SubCategory Failed`));
    }

    return res.status(200).json(new apiResponse(200, "subcategory deleted"));
  } catch (error) {
    console.log("error while deleting subcategory via ID", error);
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
  subcategoryUpdate,
  subcategoryDelete,
};

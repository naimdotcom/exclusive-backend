const Product = require("../Model/product.model.js");
const apiError = require("../utils/ApiError.js");
const apiResponse = require("../utils/ApiResponse.js");
const { uploadImage, deleteImage } = require("../utils/cloudinary.js");
const subCategoryModel = require("../Model/subCategory.model.js");
const categoryModel = require("../Model/category.model.js");
const nodeCache = require("node-cache");
const cacheData = new nodeCache();

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      rating,
      size,
      color,
      category,
      categoryId,
      subcategoryId,
      subcategory,
      quantity,
      discount,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !rating ||
      !(size.length > 0) ||
      !color ||
      (!subcategory && !subcategoryId) ||
      (!category && !categoryId) ||
      !quantity ||
      !discount
    ) {
      return res
        .status(400)
        .json(
          new apiError(400, "bad request - all fields required", null, null)
        );
    }

    if (Array.isArray(req.files.image) && req.files.image.length === 0) {
      return res
        .status(400)
        .json(new apiError(400, "bad request - images required", null, null));
    }

    const isProductExists = await Product.findOne({ name: name });
    if (isProductExists) {
      return res
        .status(400)
        .json(
          new apiError(400, "bad request - product already exists", null, null)
        );
    }

    const isCategoryExist = await categoryModel.find({
      $or: [{ name: category }, { _id: categoryId }],
    });
    const isSubcategoryExist = await subCategoryModel.find({
      $or: [{ _id: subcategoryId }, { name: subcategory }],
    });

    if (!isCategoryExist || !isSubcategoryExist) {
      res
        .status(400)
        .json(
          new apiError(400, "category does not exist or something went wrong")
        );
    }

    let cloudinaryUrls = [];

    const productUploader = async (path) => {
      const { secure_url } = await uploadImage(path);
      cloudinaryUrls.push(secure_url);
    };

    for (let img of req.files.image) {
      await productUploader(img.path);
    }

    const sizes = Array.isArray(req.body.size)
      ? req.body.size
      : [req.body.size];
    const savedProduct = await Product.create({
      name: name,
      description: description,
      price: price,
      rating: rating,
      size: sizes,
      color: color,
      images: [...cloudinaryUrls],
      category: isCategoryExist[0]?.id,
      ...(isSubcategoryExist[0] && { subcategory: isSubcategoryExist[0].id }),
      stock: quantity,
      discount: discount,
    });
    isCategoryExist[0].product.push(savedProduct.id);
    if (isSubcategoryExist.length > 0) {
      isSubcategoryExist[0].products.push(savedProduct.id);
    }

    await isCategoryExist[0].save();
    await isSubcategoryExist[0].save();

    if (!savedProduct) {
      return res
        .status(500)
        .json(new apiError(500, "product not created", null, null));
    }

    res
      .status(200)
      .json(new apiResponse(200, "product created", savedProduct, null));
  } catch (error) {
    console.log(`error from creating product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const getAllProduct = async (req, res) => {
  // console.log("got");
  try {
    const cache = cacheData.get("allProducts");
    if (cache == undefined) {
      const products = await Product.find();
      if (!products) {
        return res
          .status(500)
          .json(new apiError(500, "products not found", null, null));
      }
      cacheData.set("allProducts", JSON.stringify(products), 60 * 60 * 60);
      return res
        .status(200)
        .json(new apiResponse(200, "products found", products, null));
    } else {
      res
        .status(200)
        .json(new apiResponse(200, "products found", JSON.parse(cache), null));
    }
  } catch (error) {
    console.log(`error from getting all product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(500)
        .json(new apiError(500, "product not found", null, null));
    }

    res.status(200).json(new apiResponse(200, "product found", product, null));
  } catch (error) {
    console.log(`error from getting single product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const updateProductInformation = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.images) {
      return res
        .status(400)
        .json(
          new apiError(
            400,
            "bad request - you can't update the image",
            null,
            null
          )
        );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: req.body,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(400)
        .json(
          new apiError(400, "product not found or update failed", null, null)
        );
    }

    const cache = cacheData.get("allProducts");
    if (cache) {
      cacheData.del("allProducts");
    }

    res
      .status(200)
      .json(new apiResponse(200, "product updated", updatedProduct, null));
  } catch (error) {
    console.log(`error from updating product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const updateProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageInfo } = req.body;

    const uploadedFiles = req.files?.image
      ? Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image]
      : [];

    const imagesInfo = imageInfo
      ? Array.isArray(imageInfo)
        ? imageInfo
        : [imageInfo]
      : [];

    console.log("imageInfo", imagesInfo);
    console.log("req.files", uploadedFiles);

    // check if there is any image or not
    if (
      uploadedFiles.length === 0 &&
      (!imagesInfo || !Array.isArray(imagesInfo) || imagesInfo.length === 0)
    ) {
      return res
        .status(400)
        .json(
          new apiError(
            400,
            "Bad request - you must provide at least one image",
            null,
            null
          )
        );
    }

    // find the product
    const product = await Product.findById(id);
    // check if product exists
    if (!product) {
      return res
        .status(400)
        .json(new apiError(400, "product not found", null, null));
    }

    // delete the image from cloudinary
    if (Array.isArray(imagesInfo) && imagesInfo.length > 0) {
      for (let img of imagesInfo) {
        const allParticle = img.split("/");
        const cloudinaryUrl = allParticle[allParticle.length - 1].split(".")[0];
        await deleteImage(cloudinaryUrl);
        product.images.pull(img);
        console.log("image deleted from cloudinary", img);
      }
      console.log("images deleted from cloudinary");
    }

    //upload the image in cloudinary and store url in array
    let newImageUrl = [];
    if (uploadedFiles.length > 0) {
      for (let img of uploadedFiles) {
        const uploadedImage = await uploadImage(img.path);
        newImageUrl.push(uploadedImage.secure_url);
      }
    }

    // check if the image is updated or not
    product.images = [...product.images, ...newImageUrl];
    const updatedProduct = await product.save();
    if (!updatedProduct) {
      return res
        .status(400)
        .json(new apiError(400, "update failed", null, null));
    }

    const cache = cacheData.get("allProducts");
    if (cache) {
      cacheData.del("allProducts");
    }

    // return the updated product
    res
      .status(200)
      .json(new apiResponse(200, "product updated", updatedProduct, null));
  } catch (error) {
    console.log(`error from updating product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res
        .status(400)
        .json(new apiError(400, "product not found", null, null));
    }
    const cache = cacheData.get("allProducts");
    if (cache) {
      cacheData.del("allProducts");
    }
    res
      .status(200)
      .json(new apiResponse(200, "product deleted", deletedProduct, null));
  } catch (error) {
    console.log(`error from deleting product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

module.exports = {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProductInformation,
  updateProductImages,
  deleteProduct,
};

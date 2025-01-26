const FlashSales = require("../Model/flashSales.model.js");
const apiError = require("../utils/ApiError.js");
const apiResponse = require("../utils/ApiResponse.js");
const nodeCache = require("node-cache");
const cacheData = new nodeCache();

const createFlashSales = async (req, res) => {
  try {
    const { title, product } = req.body;

    if (!title || !product) {
      return res
        .status(404)
        .json(new apiError(404, "title and product missing"));
    }

    const flashSales = await FlashSales.create({
      title: title,
      product: product,
    });

    if (!flashSales) {
      return res
        .status(500)
        .json(new apiError(500, "internal error while creating flash sale"));
    }

    return res.status(200).json(new apiError(200, "successfull", flashSales));
  } catch (error) {
    console.log("error while creating flash sale ", error);
    res
      .status(500)
      .json(
        new apiError(500, "something went wrong while creating flash sale")
      );
  }
};

const getAllFlashSale = async (req, res) => {
  try {
    const data = cacheData.get("flashsale");
    if (data == undefined) {
      const allflashsale = await FlashSales.find().populate("product");
      cacheData.set("flashsale", allflashsale, 60);
      if (!allflashsale) {
        return res
          .status(500)
          .json(new apiError(500, ` flashSale retrived Failed`, null, null));
      }

      return res
        .status(200)
        .json(
          new apiResponse(200, `FlashSale retrived Sucessfull`, allflashsale)
        );
    } else {
      return res
        .status(200)
        .json(new apiResponse(200, `FlashSale retrived Sucessfull`, data));
    }
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError(
          500,
          `create flashSale controller Error : ${error}`,
          null,
          null
        )
      );
  }
};

module.exports = {
  createFlashSales,
  getAllFlashSale,
};

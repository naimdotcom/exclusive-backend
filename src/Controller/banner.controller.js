const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");
const Banner = require("../Model/banner.model");
const { uploadImage, deleteImage } = require("../utils/cloudinary");

const createBanner = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.files || !title) {
      return res
        .status(404)
        .json(new apiError(404, "creadential error, titile or image missing"));
    }
    const banner = await Banner.find({
      title: title,
    });

    if (banner) {
      return res.status(406).json(new apiError(406, "banner already exist"));
    }

    const uploadResult = await uploadImage(req?.files?.image[0]?.path);

    const saveBanner = await Banner.create({
      title: title,
      image: uploadResult.secure_url,
    });
    if (!saveBanner) {
      return res.status(500).json(new apiError(500, "something went wrong"));
    }

    return res
      .status(201)
      .json(new apiResponse(201, "banner created..", saveBanner));
  } catch (error) {
    console.log("error while creating banner ", error);
    res
      .status(500)
      .json(new apiError(500, "something went wrong while creating banner"));
  }
};

const updateBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const image = req.files?.image?.[0];
    if (!title && !image) {
      return res.status(406).json(new apiError(406, "title and image missing"));
    }
    const updatedData = {
      ...(title && { title: title }),
    };
    if (image) {
      const url = await uploadImage(req.files?.image?.[0].path);
      info = {
        ...info,
        image: url.secure_url,
      };
    }

    const bannerUpdated = await Banner.findByIdAndUpdate();
  } catch (error) {
    console.log("error while creating banner ", error);
    res
      .status(500)
      .json(new apiError(500, "something went wrong while creating banner"));
  }
};

module.exports = { createBanner, updateBanner };

const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");
const Banner = require("../Model/banner.model");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const nodeCache = require("node-cache");
const Cache = new nodeCache();
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
    if (banner.length > 0) {
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

    const bannerData = Cache.get("banner");
    if (bannerData) {
      Cache.del("banner");
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

const getBanner = async (req, res) => {
  try {
    const bannerData = Cache.get("banner");
    if (!bannerData) {
      const banner = await Banner.find();

      if (banner.length === 0 || !banner) {
        return res.status(500).json(new apiError(500, "internal error"));
      }
      Cache.set("banner", banner, 60 * 60 * 60);
      return res.status(200).json(new apiResponse(200, "", banner));
    } else {
      return res.status(200).json(new apiResponse(200, "", bannerData));
    }
  } catch (error) {
    console.log("error while getting banner ", error);
    res
      .status(500)
      .json(new apiError(500, "something went wrong while getting banner"));
  }
};

const updateBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const { id } = req.params;
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

    const bannerUpdated = await Banner.findByIdAndUpdate(
      { _id: id },
      { ...info },
      { new: true }
    );
    if (!bannerUpdated) {
      return res
        .status(501)
        .json(new apiError(501, "banner not updated, internal error"));
    }
    //  update the cache
    const bannerData = Cache.get("banner");
    if (bannerData) {
      Cache.del("banner");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "banner updated", bannerUpdated));
  } catch (error) {
    console.log("error while creating banner ", error);
    res
      .status(500)
      .json(new apiError(500, "something went wrong while creating banner"));
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const bannerDeleted = await Banner.findByIdAndDelete({ _id: id });

    //  update the cache
    const bannerData = Cache.get("banner");
    if (bannerData) {
      Cache.del("banner");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "banner deleted", bannerDeleted));
  } catch (error) {
    console.log("error while deleting banner ", error);
    res
      .status(500)
      .json(new apiError(500, "something went wrong while deletings banner"));
  }
};

module.exports = { createBanner, updateBanner, getBanner, deleteBanner };

const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadImage = async (file) => {
  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(file, {
      transformation: [
        {
          quality: 35,
        },
        {
          fetch_format: "auto",
        },
      ],
    });
    if (uploadResult) {
      fs.unlinkSync(file);
    }
    return uploadResult;
  } catch (error) {
    console.log("error from cloudinary upload image:" + error);
  }
};

const deleteImage = async (public_id) => {
  try {
    if (!public_id) {
      console.log("public id not found");
      return;
    }
    return await cloudinary.api.delete_resources([public_id], {
      resource_type: "image",
      type: "upload",
    });
  } catch (error) {
    console.log("error from cloudinary delete image:" + error);
  }
};

module.exports = { uploadImage, deleteImage };

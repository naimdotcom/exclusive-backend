const Product = require("../Model/product.model.js");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, rating, size, color } = req.body;

    if (!name || !description || !price || !rating || !size || !color) {
      return res
        .status(400)
        .json(
          new apiError(400, "bad request - all fields required", null, null)
        );
    }

    if (!req.files) {
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

    let cloudinaryUrls = [];

    for (let img of req.files) {
      await uploadImage(img.path).then((result) => {
        cloudinaryUrls.push(result.secure_url);
      });
    }

    const savedProduct = await Product.create({
      name: name,
      description: description,
      price: price,
      rating: rating,
      size: size,
      color: color,
      images: cloudinaryUrls,
    });

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

const createProduct = async (req, res) => {
  try {
  } catch (error) {
    console.log(`error from creating product: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

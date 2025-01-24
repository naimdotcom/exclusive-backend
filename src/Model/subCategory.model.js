const mongoose = require("mongoose");

const { Schema } = mongoose;

const subCatgorySchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
  },
});

const subCategory = mongoose.model("subCategory", subCatgorySchema);

module.export = subCategory;

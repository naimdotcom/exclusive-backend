const { app } = require("./app");
const { connectDB } = require("./src/DB/index");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `exclusive app listening on port: ${process.env.PORT || 3000}`
      );
    });
    console.log("Connected to DB");
  })
  .catch((err) => console.log(`error from mongoDB connection: ${err}`));

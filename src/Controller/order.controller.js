const SSLCommerzPayment = require("sslcommerz-lts");
const Cart = require("../Model/cart.model");
const Order = require("../Model/order.mode");
const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");

const placeOrder = async (req, res) => {
  try {
    const { customerInfo, paymentinfo } = req.body;
    const { phone, address1, city, district } = customerInfo;
    const { paymentmethod } = paymentinfo;
    console.log(paymentmethod);

    if (!phone || !address1 || !city || !district) {
      return res.status(400).json(new apiError(400, "bad request", null, null));
    }

    const { _id } = req.user;

    const cart = await Cart.find({ user: _id })
      .populate({
        path: "product",
      })
      .populate({
        path: "user",
        select:
          "-password -isVerified -otp -otpExpirationTime -createdAt -updatedAt",
      });

    if (!cart) {
      return res
        .status(400)
        .json(new apiError(400, "cart not found", null, null));
    }

    const orderinfo = cart.reduce(
      (initalItem, item) => {
        const { _id, product, quantity } = item;
        initalItem.cart.push(_id);
        initalItem.totalPrice += parseInt(product.price) * parseInt(quantity);
        return initalItem;
      },
      {
        cart: [],
        totalPrice: 0,
      }
    );

    const id = crypto.randomUUID();
    const transId = `REF${id.split("-").join("")}`;

    if (paymentmethod == "cash") {
      paymentinfo.tran_id = transId;
      const order = await new Order({
        user: _id,
        cart: orderinfo.cart,
        paymentinfo: paymentinfo,
        customerinfo: customerInfo,
        totalPrice: orderinfo.totalPrice,
      }).save();
      return res.status(200).json(new apiResponse(200, "order placed", order));
    } else if (paymentmethod == "online") {
      const data = {
        total_amount: orderinfo.totalPrice,
        currency: "BDT",
        tran_id: transId, // use unique tran_id for each api call
        success_url: "http://localhost:3000/api/v1/success",
        fail_url: "http://localhost:3000/api/v1/fail",
        cancel_url: "http://localhost:3000/api/v1/cancel",
        ipn_url: "http://localhost:3000/api/v1/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: cart[0].user.name,
        cus_email: cart[0].user.email,
        cus_add1: address1,
        // cus_add2: "Dhaka",
        cus_city: city,
        cus_state: district,
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: phone,
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const sslcz = new SSLCommerzPayment(
        process.env.SSLCOMMERZ_STORE_ID,
        process.env.SSLCOMMERZ_STORE_PASSWORD,
        process.env.SSLCOMMERZ_IS_LIVE
      );
      const apiRes = await sslcz.init(data);
      let GatewayPageURL = apiRes.GatewayPageURL;
      const order = await new Order({
        user: _id,
        cart: orderinfo.cart,
        paymentinfo: paymentinfo,
        customerinfo: customerInfo,
        totalPrice: orderinfo.totalPrice,
      });
      order.paymentinfo.tran_id = transId;
      await order.save();

      console.log(GatewayPageURL);
      return res
        .status(200)
        .json(new apiResponse(200, "order placed", { url: GatewayPageURL }));
    }
  } catch (error) {
    console.log(`error from place order: ${error}`);
    res.status(400).json(new apiError(400, "bad request", null, null));
  }
};

module.exports = {
  placeOrder,
};

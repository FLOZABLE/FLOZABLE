const stripe = require("stripe")(process.env.STRIPE_SECRET);
const express = require("express");
const Router = express.Router();
const { autoSignin } = require("../Utils/tool");
const { RESPONSE_CODES } = require("../Constant");
const { userCache } = require("../services/redisLoader");
const pool = require("../model/pool");
const { validateString, validateURL } = require("../Utils/validate");

/* Router.get("/client-secret", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const userInfo = await userCache(userId);

      if (!userInfo) return res.send(RESPONSE_CODES["no-user"]);

      const { name, email } = userInfo;
      const customer = await stripe.paymentIntents.create({
        amount: 2000,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(customer, customer.client_secret);
      res.send({ success: true, secret: customer.client_secret });
    } catch (err) {
      console.log(err);
    }
  });
}); */

Router.post("/create-checkout-session", async (req, res) => {
  const { priceId, success_url, cancel_url } = req.body;

  console.log("price", priceId);
  try {
    /* const isValidPriceId = validateString(priceId, "price id", 200);

    if (!isValidPriceId.isValid) {
      return res.send({ success: false, reason: isValidPriceId.reason });
    } */

    const isValidSuccessUrl = validateURL(
      success_url,
      true,
      process.env.SERVER_CORS.split(", ")
    );

    /* if (!isValidSuccessUrl.isValid) {
      return res.send({ success: false, reason: isValidSuccessUrl.reason });
    }

    const isValidCancelUrl = validateURL(
      cancel_url,
      true,
      process.env.SERVER_CORS.split(", ")
    );

    if (!isValidCancelUrl.isValid) {
      return res.send({ success: false, reason: isValidCancelUrl.reason });
    } */

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: success_url,
      cancel_url: cancel_url,
    });
    console.log(session, "gd");
    res.send({ success: true, client_secret: session.id }); // Returning the session ID (client secret) to the frontend
  } catch (err) {
    console.log(err);
  }
});

Router.get("/products", async (req, res) => {
  try {
    const _products = await stripe.products.list({
      limit: 10,
    });

    const _prices = await stripe.prices.list({
      limit: 10,
    });

    const prices = _prices.data.map((price) => {
      const {product, recurring, unit_amount, id} = price;
      return {product, recurring, unit_amount, id};
    })

    console.log(prices);

    const products = _products.data.map((_product) => {
      const { id, active, recurring, product, name, default_price } = _product;
      const price = prices.find(price => price.product === id);
      return { id, active, recurring, product, name, default_price, price };
    });

    console.log(products)

    res.send({ success: true, data: { products } });
  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;

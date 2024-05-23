const stripe = require("stripe")(process.env.STRIPE_SECRET);
const express = require("express");
const { autoSignin } = require("../tool");
const { responseCodes } = require("../Constant");
const { userCache } = require("../services/redisLoader");
const pool = require("../model/pool");
const { validateString, validateURL } = require("../validate");
const Router = express.Router();

Router.get("/client-secret", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const userInfo = await userCache(userId);

      if (!userInfo) return res.send(responseCodes["no-user"]);

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
});

Router.post("/create-checkout-session", async (req, res) => {
  const { priceId, success_url, cancel_url } = req.body;

  try {
    const isValidPriceId = validateString(priceId, "price id");

    if (!isValidPriceId.isValid) {
      return res.send({ success: false, reason: isValidPriceId.reason });
    }

    const isValidSuccessUrl = validateURL(
      success_url,
      true,
      process.env.SERVER_CORS.split(", ")
    );

    if (!isValidSuccessUrl.isValid) {
      return res.send({ success: false, reason: isValidSuccessUrl.reason });
    }

    const isValidCancelUrl = validateURL(
      cancel_url,
      true,
      process.env.SERVER_CORS.split(", ")
    );

    if (!isValidCancelUrl.isValid) {
      return res.send({ success: false, reason: isValidCancelUrl.reason });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
    });

    res.send({ succes: true, client_secret: session.id }); // Returning the session ID (client secret) to the frontend
  } catch (error) {
    res.status(500).send(error.message);
  }
});

Router.get("/products", async (req, res) => {
  try {
    const prices = await stripe.products.list({
      limit: 10,
    });

    console.log(prices)

    const information = prices.data.map((price) => {
      const { id, active, recurring, product } = price;
      return { id, active, recurring, product };
    });

    res.send({ success: true, information });

  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;

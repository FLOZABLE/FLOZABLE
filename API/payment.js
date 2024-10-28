const stripe = require("stripe")(process.env.STRIPE_SECRET);
const express = require("express");
const Router = express.Router();
const { RESPONSE_CODES } = require("../Constant");
const pool = require("../model/pool");
const { autoSignin } = require("./auth");

Router.post("/subscription/initialize", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { priceId } = req.body;

      const connection = pool.promise();
      const [[userInfo]] = await connection.query(
        `SELECT name, email, stripe_id FROM users WHERE user_id = ?`,
        [userId]
      );

      if (!userInfo) {
        return res.send(RESPONSE_CODES["no-user"]);
      }

      if (!userInfo.stripe_id) {
        const customer = await stripe.customers.create({
          name: userInfo.name,
          email: userInfo.email,
        });
        await connection.query(
          `UPDATE users SET stripe_id = ? WHERE user_id = ?`,
          [customer.id, userId]
        );
        userInfo.stripe_id = customer.id;
      }

      if (!userInfo.stripe_id) {
        return res.send(RESPONSE_CODES.error);
      }

      const subscription = await stripe.subscriptions.create({
        customer: userInfo.stripe_id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });
      const clientSecret =
        subscription.latest_invoice.payment_intent.client_secret;
      res.send({ success: true, clientSecret });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

Router.get("/product", async (req, res) => {
  try {
    const { priceId } = req.query;

    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);

    res.send({ success: true, price, product });
  } catch (err) {
    console.log(err);
    res.send(RESPONSE_CODES.error);
  }
});

module.exports = Router;

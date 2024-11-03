const stripe = require("stripe")(process.env.STRIPE_SECRET);
const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");

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
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
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
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      const subscription = await stripe.subscriptions.create({
        customer: userInfo.stripe_id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });
      const clientSecret =
        subscription.latest_invoice.payment_intent.client_secret;
      res.status(400).send({ success: true, clientSecret });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/product", async (req, res) => {
  try {
    const { priceId } = req.query;

    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);

    res.status(400).send({ success: true, price, product });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

module.exports = Router;

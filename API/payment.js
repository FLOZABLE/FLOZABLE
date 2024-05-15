const stripe = require("stripe")(process.env.STRIPE_SECRET);
const express = require("express");
const { autoSignin } = require("../tool");
const { responseCodes } = require("../Constant");
const { userCache } = require("../services/redisLoader");
const Router = express.Router();

Router.get("/client-secret", async (req, res) => {
  autoSignin(req, res, async(userId) => {
    try {
      const userInfo = await userCache(userId);

      if (!userInfo) return res.send(responseCodes['no-user']);

      const {name, email} = userInfo;
      const customer = await stripe.customers.create({
        name,
        email
      });

      console.log(customer, customer.client_secret)
    } catch (err) {
      console.log(err);
    }
  })
});

module.exports = Router;

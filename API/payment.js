const stripe = require("stripe")(process.env.STRIPE_SECRET);
const express = require("express");
const { autoSignin } = require("../tool");
const { responseCodes } = require("../Constant");
const { userCache } = require("../services/redisLoader");
const pool = require("../model/pool");
const Router = express.Router();

Router.get("/client-secret", async (req, res) => {
  autoSignin(req, res, async(userId) => {
    try {
      const userInfo = await userCache(userId);

      if (!userInfo) return res.send(responseCodes['no-user']);

      const {name, email} = userInfo;
      const customer = await stripe.paymentIntents.create({
        amount: 2000,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(customer, customer.client_secret);
      res.send({success: true, secret: customer.client_secret});
    } catch (err) {
      console.log(err);
    }
  })
});

Router.post("/invoice", async (req, res) => {
  autoSignin(req, res, async(userId) => {
    try {

      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT stripe_id FROM users WHERE user_id = ?`, [userId]);

      if (!userInfo) return res.send(responseCodes['no-user']);

      const invoice = await stripe.invoices.create({
        customer: userInfo.stripe_id,
      });

      console.log(invoice)
    } catch (err) {
      console.log(err);
    }
  })
});


module.exports = Router;

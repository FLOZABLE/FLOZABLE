const express = require("express");
const pool = require("../model/pool");
const Router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

Router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    console.log(err);
    return;
  }

  const data = event.data.object;
  const customer = data.customer;
  const connection = pool.promise();
  // Handle the event
  switch (event.type) {
    case "invoice.paid":
      console.log("customer", customer, data);
      const [[userInfo]] = await connection.query(
        `SELECT user_id FROM users WHERE stripe_id = ?`,
        [customer]
      );

      if (!userInfo) return;

      const invoice = await stripe.invoices.retrieve(data.id, {
        expand: ["lines"],
      });

      const purchases = [];
      invoice?.lines?.data.map((item) => {
        const purchase_id = data.id;
        const price_id = item.price.id;
        const product_id = item.price.product;
        const purchased_at = data.created;
        purchases.push([
          purchase_id,
          userInfo.user_id,
          price_id,
          product_id,
          purchased_at,
        ]);
      });

      console.log(invoice.lines.data, "invoice", purchases);

      if (purchases.length) {
        await connection.query(
          `INSERT IGNORE INTO purchases 
          (purchase_id, user_id, price_id, product_id, purchased_at)
          VALUES ?
          `,
          [purchases]
        );
      }
    /* case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      console.log(paymentIntentSucceeded, 'succeed')
      break; */
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 res to acknowledge receipt of the event
  res.status(400).send();
});

module.exports = Router;

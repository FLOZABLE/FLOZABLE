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

  const paymentIntent = event.data.object;
  const customer = paymentIntent.customer;
  const connection = pool.promise();
  // Handle the event
  switch (event.type) {
    case "invoice.paid":
      console.log("customer", customer, paymentIntent);
      const [[userInfo]] = await connection.query(
        `SELECT user_id FROM users WHERE stripe_id = ?`,
        [customer]
      );

      if (userInfo) {
        /* const purchase = {
          purchase_id: paymentIntent.id,
          user_id: userInfo.user_id,
          price_id: 
        } */
        await connection.query(`INSERT INTO purchases SET ?`, [])
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
  res.send();
});

module.exports = Router;

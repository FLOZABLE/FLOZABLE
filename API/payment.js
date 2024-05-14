const stripe = require('stripe')(process.env.STRIPE_SECRET);
const express = require('express');
const { autoSignin } = require('../tool');
const Router = express.Router();

Router.get("/", async (req, res) => {
  autoSignin(

  );
});

module.exports = Router;
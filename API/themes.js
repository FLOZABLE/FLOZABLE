const express = require('express');
const Router = express.Router();

Router.post('/create', async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;

  }))
});

module.exports = Router;
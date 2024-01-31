const express = require('express');
const axios = require("axios");
const { autoSignin } = require('../tool');
const Router = express.Router();

Router.get('/auth', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      axios.get(`https://cuhsd.instructure.com/login/oauth2/auth?client_id=XXX&response_type=code&redirect_uri=https://example.com/oauth_complete&state=YY`)
      .then(response => {
        console.log(response)
      });
  
    } catch (err) {

    }
    res.send({success: false});
  }
  )
  );
});


module.exports = Router;
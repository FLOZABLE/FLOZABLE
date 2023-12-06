const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const crypto = require("crypto");
const fetch = require('node-fetch');

Router.get('/join/:id', async(req, res) => {
  const groupId = req.params.id;
  if(req.session.loggedin == true){
    const sessionData = {
      group_id: req.session.group_id,
      loggedin: req.session.loggedin,
    };
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Data': JSON.stringify(sessionData),
      },
      body: JSON.stringify({ groupId }),
    };
    
    const response = await fetch(`${process.env.SERVER}/groups/join/${groupId}`, fetchOptions)
    const status = await response.json();
    res.redirect('/groups')

  } else {
    res.redirect(`/account?redirect=links/join/${groupId}`);
  }
})
module.exports = Router;
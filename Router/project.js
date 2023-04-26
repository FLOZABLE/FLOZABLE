const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios")

Router.get("/", async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'topic:lhs-programmers',
        sort: 'stars',
        order: 'desc'
      }
    });
    const repositories = response.data.items;
    console.log(repositories)
    res.render("project", {loggedin: true, repos: repositories});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching repositories');
  }
})

module.exports = Router;
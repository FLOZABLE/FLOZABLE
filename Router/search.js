const express = require("express");
const Router = express.Router(); 

Router.get("/:s", async(req, res) => {
  const query = req.params.s;
  console.log(query)
  res.render('search', {query: query})
})

module.exports = Router;
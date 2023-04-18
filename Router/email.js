const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const crypto = require("crypto");


function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

Router.post("/post-register", async(req, res) => {
  console.log(req.headers["name"], req.headers["email"]);
  const connection = await (await pool).getConnection();
  const name = req.headers['name'];
  const email = req.headers['email'];
  console.log(name, email)
  const subscribers = await connection.query("SELECT * FROM subscribers");
  let exist = false;
  
  for(let i = 0; i < subscribers.length; i++){
    console.log(subscribers[i].email, email)
    if(subscribers[i].email == email){
      exist = true;
    }
  }
  if(exist == false){
    console.log("new email")
    try {
      const subscribe = await connection.query("INSERT INTO subscribers set ?", [{name: name, email: email}]);
      console.log("Subscriber added successfully!");
      res.send({result: "success"})
    } catch (err) {
      console.log("Error while adding subscriber:", err);
      res.send({result: "Error while adding your email"});
    }
  } else {
    console.log("exist")
    res.send({result: "This email is already registered"})
  }
  connection.release();
})

module.exports = Router;
const express = require('express');
const Router = express.Router();
const {server} = require("./app");

const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/videoserver',
});

Router.use('/peerjs', peerServer);

module.exports = Router;
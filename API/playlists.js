const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const axios = require("axios");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

Router.post('/spotify-login', async (req, res) => {
    const { token, redirectURI } = req.body;

    /*
    axios.post('https://accounts.spotify.com/api/token', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=' + SPOTIFY_CLIENT_ID + '&client_secret=' + SPOTIFY_CLIENT_SECRET + '&grant_type=authorization_code&code=' + token + '&redirect_uri=' + redirectURI
    }).then((response) => response.json())
        .then((data) => {
            //console.log(data);
        }).catch((err) => {
            console.log(err);
        });
        */

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=' + SPOTIFY_CLIENT_ID + '&client_secret=' + SPOTIFY_CLIENT_SECRET + '&grant_type=authorization_code&code=' + token + '&redirect_uri=' + redirectURI
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.refresh_token) {
                //Store in server
                const refreshToken = data.refresh_token;
                const accessToken = data.access_token;

                const connection = pool.promise();
                connection.query(`UPDATE users SET spotify_refresh_token = ? WHERE user_id = ?`, [refreshToken, req.session.user_id]);
            }
        })
        .catch((error) => {
            console.log(error);
        });

});

module.exports = Router;
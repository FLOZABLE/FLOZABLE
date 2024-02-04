const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const axios = require("axios");
const { autoSignin, generateRandomId } = require("../tool");
const redisClient = require("../model/redis");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

Router.post('/spotify-login', async (req, res) => {
    const { token, redirectURI, userId } = req.body;

    async function returnName(currentAccessToken) { // if yes, return their username
        const accessToken = currentAccessToken;

        fetch('https://api.spotify.com/v1/me/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => response.json())
            .then(async (data) => {
                if (!!data.display_name) {
                    return res.send({ success: true, name: data.display_name, msg: `Logged in as ${data.display_name}`});
                }
                else {
                    return res.send({ success: false, reason: "An error occured" });
                }
            });
    }

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=' + SPOTIFY_CLIENT_ID + '&client_secret=' + SPOTIFY_CLIENT_SECRET + '&grant_type=authorization_code&code=' + token + '&redirect_uri=' + redirectURI
    })
        .then((response) => response.json())
        .then(async (data) => {
            if (data.refresh_token) {
                //Store in server
                const refreshToken = data.refresh_token;
                const accessToken = data.access_token;
                await redisClient.set(`user:${userId}:spotifyAccessToken`, accessToken);
                redisClient.expire(`user:${userId}:spotifyAccessToken`, 3000); //expire in 50 min
                const connection = pool.promise();
                connection.query(`UPDATE users SET spotify_refresh_token = ? WHERE user_id = ?`, [refreshToken, userId]);

                returnName(accessToken);
            }
        })
        .catch((error) => {
            console.log(error);
        });

});

Router.get('/spotify-logged-in', async (req, res) => { //check if user is logged into their spotify account.
    autoSignin(req, res, (async () => {

        async function returnName(currentAccessToken) { // if yes, return their username
            const accessToken = currentAccessToken;

            fetch('https://api.spotify.com/v1/me/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then((response) => response.json())
                .then(async (data) => {
                    if (!!data.display_name) {
                        return res.send({ auth: true, name: data.display_name });
                    }
                    else {
                        return res.send({ auth: false, reason: "An error occured" });
                    }
                });
        }

        const connection = pool.promise();
        try {
            const userId = req.session.user_id;

            const oldAccessToken = await redisClient.exists(`user:${userId}:spotifyAccessToken`);
            if (oldAccessToken) {
                const currentAccessToken = await redisClient.get(`user:${userId}:spotifyAccessToken`);
                returnName(currentAccessToken);
                return;
            }

            const [[refreshToken]] = await connection.query(`SELECT spotify_refresh_token FROM users WHERE user_id = ?`, [userId]);

            if (!refreshToken) {
                return res.send({ auth: false });
            }
            else {
                fetch('https://accounts.spotify.com/api/token', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
                    },
                    body: `grant_type=refresh_token&refresh_token=${refreshToken.spotify_refresh_token}`,
                }).then((response) => response.json())
                    .then(async (data) => {
                        if (data.access_token) {
                            await redisClient.set(`user:${userId}:spotifyAccessToken`, data.access_token);
                            redisClient.expire(`user:${userId}:spotifyAccessToken`, 3000);
                            currentAccessToken = data.access_token;
                            returnName(currentAccessToken);
                        }
                        else {
                            return res.send({ auth: false }); //the user most likely invalidated their refresh token
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
            }

        } catch (err) {
            console.log(err);
        }
    }))
});

Router.get('/spotify-playlists', async (req, res) => {

    async function searchForPlaylists(currentAccessToken) {
        const accessToken = currentAccessToken;
        const userPlaylists = [];

        fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => response.json())
            .then(async (data) => {
                if (!!data.items) {
                    data.items.map((playlist) => {
                        userPlaylists.push({name: playlist.name, url: playlist.external_urls.spotify})
                    });
                    return res.send({ success: true, data: userPlaylists });
                }
                else {
                    return res.send({ success: false, reason: "An error occured" });
                }
            });
    }

    autoSignin(req, res, (async () => {
        const connection = pool.promise();
        try {
            const userId = req.session.user_id;
            const oldAccessToken = await redisClient.exists(`user:${userId}:spotifyAccessToken`);
            let currentAccessToken = ""

            if (!oldAccessToken) {
                const [[refreshToken]] = await connection.query(`SELECT spotify_refresh_token FROM users WHERE user_id = ?`, [userId]);
                if (!!refreshToken && refreshToken.spotify_refresh_token.length > 0) {
                    //Generate a new access token from refresh token

                    fetch('https://accounts.spotify.com/api/token', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
                        },
                        body: `grant_type=refresh_token&refresh_token=${refreshToken.spotify_refresh_token}`,
                    }).then((response) => response.json())
                        .then(async (data) => {
                            if (data.access_token) {
                                await redisClient.set(`user:${userId}:spotifyAccessToken`, data.access_token);
                                redisClient.expire(`user:${userId}:spotifyAccessToken`, 3000); //expire in 50 min (10 minute buffer)
                                currentAccessToken = data.access_token;
                                searchForPlaylists(currentAccessToken);
                            }
                            else {
                                return res.send({ success: false, reason: "Access Token Unable to Refresh" });
                            }
                        }).catch((err) => {
                            console.log(86, err);
                        });
                }
                else {
                    return res.send({ success: false, reason: "User not authenticated" }); //the user never auth'ed with spotify
                }
            }
            else {
                currentAccessToken = await redisClient.get(`user:${userId}:spotifyAccessToken`);
                searchForPlaylists(currentAccessToken);
            }
        } catch (err) {
            console.log(err);
        }
    }))
});

module.exports = Router;
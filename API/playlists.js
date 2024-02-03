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
            }
        })
        .catch((error) => {
            console.log(error);
        });

});

Router.get('/spotify-refresh-token', async (req, res) => {
    autoSignin(req, res, (async () => {
        const connection = pool.promise();
        try {
            const userId = req.session.user_id;
            const [[refreshToken]] = await connection.query(`SELECT spotify_refresh_token FROM users WHERE user_id = ?`, [userId]);
            if (!refreshToken) {
                return res.send({ success: false, reason: "User not authenticated" });
            }
            return res.send({ success: refreshToken.length > 0 });
        } catch (err) {
            console.log(err);
        }
    }))
});

Router.get('/spotify-playlists', async (req, res) => {
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
                            }
                            else{
                                return res.send({success: false, reason: "Access Token Unable to Refresh"});
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                }
                else {
                    return res.send({ success: false, reason: "User not authenticated" }); //the user never auth'ed with spotify
                }
            }
            else{
                currentAccessToken = await redisClient.get(`user:${userId}:spotifyAccessToken`);
            }
            const accessToken = currentAccessToken;
            const userPlaylists = [];

            fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then((response) => response.json())
                .then(async (data) => {
                    if (!!data.items) {
                        await Promise.all(data.items.map(async (playlist) => {
                            let playlistObj = { name: playlist.name };
                            const playlistItems = [];
                            await fetch(`${playlist.href}/tracks`, {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            }).then((response) => response.json())
                                .then((playlistData) => {
                                    if (playlistData.items) {
                                        playlistData.items.map(({ track }) => {
                                            playlistItems.push({ name: track.name, url: track.external_urls.spotify, artists: track.artists });
                                        });
                                        playlistObj = { ...playlistObj, tracks: playlistItems };
                                    }
                                    userPlaylists.push(playlistObj);
                                });
                        }));
                        return res.send({ success: true, data: userPlaylists });
                    }
                    else {
                        return res.send({ success: false, reason: "An error occured" });
                    }
                })

        } catch (err) {
            console.log(err);
        }
    }))
});

module.exports = Router;
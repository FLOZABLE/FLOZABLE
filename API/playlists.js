const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const axios = require("axios");
const {
  hashing,
  autoSignin,
  generateRandomId,
  googleOauth2client,
  isValidTimeZone,
} = require("../Utils/tool");
const { UserRefreshClient } = require("google-auth-library");
const redisClient = require("../model/redis");
const {
  googleAccessTokenCache,
  spotifyAuthTokenCache,
} = require("../services/redisLoader");
const { responseCodes } = require("../Constant");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.GOOGLE_API_KEY;

Router.get("/youtube-playlists", async (req, res) => {
  async function getPlaylistVideos(
    playlistId,
    access_token,
    nextPageToken = null,
    pageNum = 0
  ) {
    if (pageNum > 5) {
      return []; //To prevent too many requests
    }
    let fetchUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
    if (nextPageToken) {
      fetchUrl += `&pageToken=${nextPageToken}`;
    }
    return fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
        const nextPageToken = data.nextPageToken;
        let videoResults = [];
        if (data.items) {
          data.items.map((video) => {
            videoResults.push(video.snippet.resourceId.videoId);
          });
        }
        return nextPageToken
          ? videoResults.concat(
              await getPlaylistVideos(
                playlistId,
                access_token,
                nextPageToken,
                pageNum + 1
              )
            )
          : videoResults;
      });
  }

  autoSignin(req, res, async (userId) => {
    try {
      try {
        const access_token = await googleAccessTokenCache(userId);

        fetch(
          `https://youtube.googleapis.com/youtube/v3/playlists?part=id,snippet&fields=items(id,snippet(title,channelId,channelTitle))&maxResults=10&mine=true&key=${YOUTUBE_API_KEY}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then(async (data) => {
            try {
              return await Promise.all(
                data.items.map(async (playlist) => {
                  return [
                    playlist.id,
                    await getPlaylistVideos(playlist.id, access_token),
                  ];
                })
              );
            } catch (err) {
              return { success: false, reason: "An error occured" };
            }
          })
          .then((result) => {
            res.send(result);
          });
      } catch (err) {
        if (
          err.response &&
          err.response &&
          err.response.data &&
          err.response.data.error === "invalid_grant"
        ) {
          connection.query(
            `UPDATE users set google_refresh_token = NULL WHERE user_id = ?`,
            [userId]
          );
        }
      }
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.get("/spotify/info", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const accessToken = await spotifyAuthTokenCache(userId);
      if (!accessToken) {
        return res.send(responseCodes["no-user"]);
      }

      const response = await fetch("https://api.spotify.com/v1/me/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.error) {
        return res.send({ success: false, reason: data.error.message });
      }

      res.send({ success: true, spotifyInfo: data });
    } catch (err) {
      console.log(err);
      res.send(responseCodes["error"]);
    }
  });
});

Router.get("/spotify-playlists", async (req, res) => {
  async function searchForPlaylists(currentAccessToken) {
    const accessToken = currentAccessToken;
    const userPlaylists = [];

    fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (!!data.items) {
          data.items.map((playlist) => {
            userPlaylists.push({
              name: playlist.name,
              url: playlist.external_urls.spotify,
            });
          });
          return res.send({ success: true, data: userPlaylists });
        } else {
          return res.send({ success: false, reason: "An error occured" });
        }
      });
  }

  autoSignin(req, res, async () => {
    const connection = pool.promise();
    try {
      const userId = req.session.user_id;
      const oldAccessToken = await redisClient.exists(
        `user:${userId}:spotifyAccessToken`
      );
      let currentAccessToken = "";

      if (!oldAccessToken) {
        const [[refreshToken]] = await connection.query(
          `SELECT spotify_refresh_token FROM users WHERE user_id = ?`,
          [userId]
        );
        if (!!refreshToken && refreshToken.spotify_refresh_token.length > 0) {
          //Generate a new access token from refresh token

          fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
              ).toString("base64")}`,
            },
            body: `grant_type=refresh_token&refresh_token=${refreshToken.spotify_refresh_token}`,
          })
            .then((response) => response.json())
            .then(async (data) => {
              if (data.access_token) {
                await redisClient.set(
                  `user:${userId}:spotifyAccessToken`,
                  data.access_token
                );
                redisClient.expire(`user:${userId}:spotifyAccessToken`, 3000); //expire in 50 min (10 minute buffer)
                currentAccessToken = data.access_token;
                searchForPlaylists(currentAccessToken);
              } else {
                return res.send({
                  success: false,
                  reason: "Access Token Unable to Refresh",
                });
              }
            })
            .catch((err) => {
              console.log(86, err);
            });
        } else {
          return res.send({ success: false, reason: "User not authenticated" }); //the user never auth'ed with spotify
        }
      } else {
        currentAccessToken = await redisClient.get(
          `user:${userId}:spotifyAccessToken`
        );
        searchForPlaylists(currentAccessToken);
      }
    } catch (err) {
      console.log(err);
    }
  });
});

module.exports = Router;

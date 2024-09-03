const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const { autoSignin } = require("../Utils/tool");
const {
  googleAccessTokenCache,
  spotifyAccessTokenCache,
} = require("../services/redisLoader");
const querystring = require("querystring");
const { RESPONSE_CODES } = require("../Constant");
const { googleOauth2client } = require("./auth");
const { google } = require("googleapis");

const YOUTUBE_API_KEY = process.env.GOOGLE_API_KEY;

Router.get("/spotify/info", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const accessToken = await spotifyAccessTokenCache(connection, userId);
      if (!accessToken) {
        return res.send(RESPONSE_CODES["no-user"]);
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
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.get("/spotify", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const accessToken = await spotifyAccessTokenCache(connection, userId);

      if (!accessToken) {
        return res.send(RESPONSE_CODES["not-authed"]);
      }

      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (data.error) {
        return res.send({ success: false, reason: data.error.message });
      }

      res.send({ success: true, playlists: data.items });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.get("/youtube", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const googleAccessToken = await googleAccessTokenCache(
        connection,
        userId
      );

      if (!googleAccessToken) {
        return res.send(RESPONSE_CODES["no-user"]);
      }

      const auth = googleOauth2client({ access_token: googleAccessToken });
      if (!auth) {
        return res.send(RESPONSE_CODES["error"]);
      }

      const youtube = google.youtube({ version: "v3", auth });
      const response = await youtube.playlists.list({
        part: "snippet",
        mine: true,
        maxResults: 25,
        key: YOUTUBE_API_KEY,
      });

      const playlists = response.data.items;
      return res.send({ success: true, playlists });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

const MAX_LENGTH = 300;
Router.get("/youtube/items", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { playlistId } = req.query;

      if (!playlistId) {
        return res.send({ success: false, reason: "playlistId missing" });
      }

      const connection = pool.promise();
      const googleAccessToken = await googleAccessTokenCache(
        connection,
        userId
      );

      if (!googleAccessToken) {
        return res.send(RESPONSE_CODES["no-user"]);
      }

      const auth = googleOauth2client({ access_token: googleAccessToken });
      if (!auth) {
        return res.send(RESPONSE_CODES["error"]);
      }

      const youtube = google.youtube({ version: "v3", auth });
      let items = [];
      let nextPageToken = null;

      do {
        const response = await youtube.playlistItems.list({
          part: "snippet",
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
          key: YOUTUBE_API_KEY,
        });

        items = items.concat(response.data.items);
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken && items.length < MAX_LENGTH);

      return res.send({ success: true, items });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

module.exports = Router;

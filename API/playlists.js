const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const {
  googleAccessTokenCache,
  spotifyAccessTokenCache,
  clearGoogleAccessToken,
} = require("../services/redisLoader");
const querystring = require("querystring");
const RESPONSE_MESSAGES = require("../utils/responses");
const { googleOauth2client, autoSignin } = require("./auth");
const { google } = require("googleapis");
const { validateStrictString } = require("../utils/validate");

const YOUTUBE_API_KEY = process.env.GOOGLE_API_KEY;

Router.get("/spotify/info", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const accessToken = await spotifyAccessTokenCache(connection, userId);
      if (!accessToken) {
        return res.status(400).send({
          success: false,
          status: 400,
          error: { reason: "Auth Required" },
        });
      }

      const response = await fetch("https://api.spotify.com/v1/me/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: response.statusText || "Failed to fetch user info",
        });
      }

      const data = await response.json();

      if (data.error) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: data.error.message,
          error: { reason: data.error.message },
        });
      }

      res.status(200).send({
        success: true,
        status: 200,
        data: { spotifyInfo: data },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/spotify", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const accessToken = await spotifyAccessTokenCache(connection, userId);

      if (!accessToken) {
        const response = RESPONSE_MESSAGES.notAuthed();
        return res.status(response.status).send(response);
      }

      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (data.error) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: data.error.message,
          error: { reason: data.error.message },
        });
      }

      res.status(200).send({
        success: true,
        status: 200,
        data: { playlists: data.items },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
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
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const auth = googleOauth2client({ access_token: googleAccessToken });
      if (!auth) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      const youtube = google.youtube({ version: "v3", auth });
      const response = await youtube.playlists.list({
        part: "snippet",
        mine: true,
        maxResults: 25,
        key: YOUTUBE_API_KEY,
      });

      const playlists = response.data.items;

      return res.status(200).send({
        success: true,
        status: 200,
        data: { playlists },
      });
    } catch (err) {
      console.log(err);
      if (!err?.response?.data?.error) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      if (err.response.data.error === "invalid_token") {
        clearGoogleAccessToken(connection, userId);
      }

      return res.status(400).send({
        success: false,
        status: 400,
        error: {
          code: err.response.data.error.code,
          reason: err.response.data.error.message,
        },
      });
    }
  });
});

const MAX_LENGTH = 300;
Router.get("/youtube/items", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { playlist_id: playlistId } = req.query;

      const isValidPlaylistId = validateStrictString(
        playlistId,
        "playlist",
        11,
        11
      );

      if (!isValidPlaylistId) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPlaylistId.reason,
          error: { reason: isValidPlaylistId.reason },
        });
      }

      const connection = pool.promise();
      const googleAccessToken = await googleAccessTokenCache(
        connection,
        userId
      );

      if (!googleAccessToken) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const auth = googleOauth2client({ access_token: googleAccessToken });
      if (!auth) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
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

      return res
        .status(200)
        .send({ success: true, status: 200, data: { items } });
    } catch (err) {
      console.log(err);
      if (!err?.response?.data?.error) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      if (err.response.data.error === "invalid_token") {
        clearGoogleAccessToken(connection, userId);
      }

      return res.status(400).send({
        success: false,
        status: 400,
        error: {
          code: err.response.data.error.code,
          reason: err.response.data.error.message,
        },
      });
    }
  });
});

module.exports = Router;

const express = require("express");
const Router = express.Router();
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId } = require("../tool");
const { default: axios } = require("axios");
const pool = require("../model/pool");

Router.get('/', async (req, res) => {
  try {
    const connection = pool.promise();
    const [themes] = await connection.query(`SELECT * FROM themes`);
    return res.send({success: true, themes});
  } catch (err) {
    console.log(err);
    res.send({success: false});
  }
});

Router.post('/create', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const {name, tags, description, url} = req.body;
      console.log(name, tags, description ,url);
    if (!name) return res.send({success: false, reason: 'Invalid name'});
    if (!description) return res.send({success: false, reason: 'No description'})
    if (!url) return res.send({success: false, reason: 'no url '});
    try {
      const videoId = new URLSearchParams(new URL(url).search).get("v");
      if (!videoId) return res.send({success: false, reason: 'Invalid URL'});
      const connection = pool.promise();
      const id = generateRandomId(10);
      const themeInfo = {id, name, description, video_id: videoId, tags: tags.join(','), user_id: userId};
      connection.query(`INSERT INTO themes SET ?`, themeInfo);
      res.send({success: true, msg: 'New theme uploaded!', themeInfo: {...themeInfo, likes: ''}});
      console.log(videoId);
    } catch (err) {
      return res.send({success: false, reason: 'invalud url'})
    }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

Router.post('/like/:id', async (req, res) => {
  autoSignin(req, res, (async() => {
    const themeId = req.params.id;
    const userId = req.session.user_id;
    const {liked} = req.body;
    if (!themeId) return res.send({success: false, reason: 'Invalid theme id'});

    try {
      const connection = pool.promise();
      if (liked) {
        const [update] = await connection.query(
          `UPDATE themes 
          SET likes = CASE 
            WHEN likes = '' THEN ?
            ELSE CONCAT(likes, ',', ?) 
            END WHERE id = ?`,
          [userId, userId, themeId]
        );
        const io = req.app.get('socketio');
        io.emit(`liked:${themeId}`, userId);
      } else {
        const [update] = await connection.query(
          `UPDATE themes 
          SET likes = 
            TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likes, ','), ',${userId},', ','))
            WHERE id = ?`,
          [themeId]
        );
        const io = req.app.get('socketio');
        io.emit(`unliked:${themeId}`, userId);
      };
      res.send({ success: true });
    } catch (err) {
      console.error('Error performing database queries:', err);
      res.status(500).send({ success: false, reason: 'An error occurred' });
    };
  }));
});

module.exports = Router;
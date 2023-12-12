const express = require("express");
const Router = express.Router();
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId, isValidJSON } = require("../tool");
const pool = require("../model/pool");

Router.get('/', async (req, res) => {
  try {
    const connection = pool.promise();
    const [themes] = await connection.query(`SELECT * FROM themes`);
    themes.map(async (theme) => {
      const usage = await redisClient.get(`theme:${theme.id}:week`);
      theme.usage = usage ? usage : 0;
    })
    return res.send({ success: true, themes });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

Router.get('/user', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const connection = pool.promise();
      const userId = req.session.user_id;
      const [[themes]] = await connection.query("SELECT themes from users where user_id = ?", [userId]);
      return res.send({ success: true, themes });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  }));
})

Router.get('/videoIds', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const connection = pool.promise();
      const { searchIds } = req.query;
      console.log(searchIds);
      const [info] = await connection.query("SELECT video_id, name, id FROM themes WHERE id IN (?)", [searchIds.split(",")]);
      return res.send({ success: true, info });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  }));
})

Router.post('/create', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { name, tags, description, url } = req.body;
      console.log(name, tags, description, url);
      if (!name) return res.send({ success: false, reason: 'Invalid name' });
      if (!description) return res.send({ success: false, reason: 'No description' })
      if (!url) return res.send({ success: false, reason: 'no url ' });
      try {
        const videoId = new URLSearchParams(new URL(url).search).get("v");
        if (!videoId) return res.send({ success: false, reason: 'Invalid URL' });
        const connection = pool.promise();
        const id = generateRandomId(10);
        const themeInfo = { id, name, description, video_id: videoId, tags: tags.join(','), user_id: userId };
        connection.query(`INSERT INTO themes SET ?`, themeInfo);
        res.send({ success: true, msg: 'New theme uploaded!', themeInfo: { ...themeInfo, likes: '' } });
        console.log(videoId);
      } catch (err) {
        return res.send({ success: false, reason: 'invalud url' })
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

Router.post('/like/:id', async (req, res) => {
  autoSignin(req, res, (async () => {
    const themeId = req.params.id;
    const userId = req.session.user_id;
    const { liked } = req.body;
    if (!themeId) return res.send({ success: false, reason: 'Invalid theme id' });

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

Router.post('/save', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { themeId, category } = req.body;
      const schema = {
        type: 'object',
        properties: {
          category: { type: 'integer', minimum: -1, maximum: 10 },
          themeId: { type: 'string', maxLength: 50 },
        },
        required: ['themeId', 'category'],
        additionalProperties: false
      };

      const isValid = isValidJSON({ themeId: themeId, category: category }, schema);

      if (!isValid) {
        return res.send({ success: false, reason: 'Wrong Information' });
      };
      const themeInfo = `${category}:${themeId}`;
      const connection = pool.promise();
      /* const [update] = await connection.query(
        `UPDATE users 
        SET themes = CASE 
          WHEN themes = '' THEN ?
          ELSE CONCAT(themes, ',', ?) 
          END WHERE user_id = ?`,
        [themeInfo, themeInfo, userId]
      ); */
      /* connection.query(
        `UPDATE users
         SET themes = CASE
           WHEN themes = '' THEN ?
           WHEN themes LIKE ? THEN themes

           WHEN themes LIKE ? OR themes LIKE ? OR themes LIKE ? OR themes LIKE ? OR themes LIKE ? OR themes LIKE ? THEN
            SUBSTRING_INDEX(themes, ?, -1)

           ELSE CONCAT(themes, ',', ?)
         END
         WHERE user_id = ?`,
        [themeInfo, `%${themeInfo}%`, `%0:${themeId}%`, `%1:${themeId}%`, `%2:${themeId}%`, `%3:${themeId}%`, `%4:${themeId}%`, `%5:${themeId}%`, `` `%${userId},%`, themeInfo, userId],
      ); */
/*       connection.query(
        `UPDATE users
         SET themes = CASE
           WHEN themes = '' THEN ?
           WHEN themes LIKE ? THEN themes

           WHEN themes LIKE ? THEN
           CONCAT(REPLACE(themes, ?, ?), SUBSTRING_INDEX(themes, ?, -1))

           ELSE CONCAT(themes, ',', ?)
         END
         WHERE user_id = ?`,
        [themeInfo, `%${themeInfo}%`,  `%:${themeId}%`, `:${themeId}`, themeInfo, `:${themeId}`, themeInfo, userId],
      ); */
      connection.query(
        `UPDATE users
         SET themes = CASE
           WHEN themes = '' THEN ?
           WHEN themes LIKE ? THEN themes

           WHEN themes LIKE ? THEN
           CONCAT(SUBSTRING(REPLACE(themes, ?, ?), 2))

           ELSE CONCAT(themes, ',', ?)
         END
         WHERE user_id = ?`,
        [themeInfo, `%${themeInfo}%`,  `%:${themeId}%`, `:${themeId}`, themeInfo, themeInfo, userId],
      );
      res.send({ success: true, msg: 'Theme Saved' });
      redisClient.incr(`theme:${themeId}:week`);
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

module.exports = Router;
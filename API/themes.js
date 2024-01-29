const express = require("express");
const Router = express.Router();
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId, isValidJSON } = require("../tool");
const pool = require("../model/pool");
const { DateTime } = require("luxon");
const { validateStrictString, validateLength, validateString, validateBoolean, validateInteger, validateURL } = require("../validate");

Router.get('/', async (req, res) => {
  try {
    const connection = pool.promise();
    const [themes] = await connection.query(`SELECT * FROM themes`);
    await Promise.all(themes.map(async (theme) => {
      const weekUsage = await redisClient.zmScore(`theme:${theme.id}:weekUsage`, ['0', '1', '2', '3', '4', '5', '6']);
      theme.weekUsage = 0;
      await Promise.all(weekUsage.map(dayTotal => {
        if (!dayTotal) return;
        theme.weekUsage += dayTotal;
      }));
    }));
    return res.send({ success: true, themes });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

Router.get('/user', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const connection = pool.promise();
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

      const isValidSearchIds = validateString(searchIds, "search ids", 200);

      if (!isValidSearchIds.isValid) {
        return res.send({ success: false, reason: isValidSearchIds.reason });
      };

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
      console.log(name.length, tags, description, url);
      if (!name || name.length >= 40) return res.send({ success: false, reason: 'Invalid name' });
      if (!description) return res.send({ success: false, reason: 'No description' })
      if (!url) return res.send({ success: false, reason: 'no url ' });

      const isValidName = validateString(name, 'theme name');

      if (!isValidName.isValid) {
        return res.send({success: false, reason: isValidName.reason});
      };

      const isValidDescription = validateString(description, 'theme description', 100);

      if (!isValidDescription.isValid) {
        return res.send({success: false, reason: isValidDescription.reason});
      };

      const isValidURL = validateURL(url);

      if (!isValidURL.isValid) {
        return res.send({success: false, reason: isValidURL.reason});
      };

      const videoId = new URLSearchParams(new URL(url).search).get("v");
      if (!videoId) return res.send({ success: false, reason: 'Invalid URL' });
      const connection = pool.promise();
      const id = generateRandomId(10);
      const themeInfo = { id, name, description, video_id: videoId, tags: tags.join(','), user_id: userId };
      connection.query(`INSERT INTO themes SET ?`, themeInfo);
      res.send({ success: true, msg: 'New theme uploaded!', themeInfo: { ...themeInfo, likes: '' } });
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
    
    const isValidLiked = validateBoolean(liked, 'liked', true);

    if (!isValidLiked.isValid) {
      return res.send({success: false, reason: isValidLiked.reason});
    };

    const isValidThemeId = validateStrictString(themeId, 'theme id');

    if (!isValidThemeId.isValid) {
      return res.send({success: false, reason: isValidThemeId.reason});
    };

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
      
      const isValidCategory = validateInteger(category, 'category', 10, -1);

      if (!isValidCategory.isValid) {
        return res.send({success: false, reason: isValidCategory.reason});
      };
  
      const isValidThemeId = validateStrictString(themeId, 'theme id');
  
      if (!isValidThemeId.isValid) {
        return res.send({success: false, reason: isValidThemeId.reason});
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
        [themeInfo, `%${themeInfo}%`, `%:${themeId}%`, `:${themeId}`, themeInfo, themeInfo, userId],
      );

      const weekDay = DateTime.now().weekday - 1;
      redisClient.zIncrBy(`theme:${themeId}:weekUsage`, 1, weekDay.toString());
      const io = req.app.get('socketio');
      io.emit(`used:${themeId}`);
      res.send({ success: true, msg: 'Theme Saved' });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

module.exports = Router;
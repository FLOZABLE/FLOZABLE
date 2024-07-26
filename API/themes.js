const express = require("express");
const Router = express.Router();
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId, isValidJSON } = require("../Utils/tool");
const pool = require("../model/pool");
const { DateTime } = require("luxon");
const {
  validateStrictString,
  validateString,
  validateBoolean,
  validateInteger,
  validateURL,
} = require("../Utils/validate");
const { mainIo } = require("../sockets/mainIo");

Router.get("/", async (req, res) => {
  try {
    const connection = pool.promise();
    const [themes] = await connection.query(`
      SELECT 
      theme_id, 
      user_id, 
      video_id, 
      name, 
      description, 
      tags 
      FROM themes
    `);

    themes.map((theme) => {
      theme.weekUsage = 0;
    });
    for (let i = 0; i < 7; i++) {
      const dayUsage = await redisClient.zmscore(
        `themes:${i}:usage`,
        themes.map((theme) => theme.theme_id)
      );

      themes.map((theme, index) => {
        if (!dayUsage[index]) return;
        theme.weekUsage += dayUsage[index];
      });
    };

    return res.send({ success: true, themes });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

Router.get("/user", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [themes] = await connection.query(
        `
        SELECT t.theme_id, t.video_id, t.name, t.description, t.tags
        FROM themes t
        JOIN user_themes ut ON t.theme_id = ut.theme_id
        WHERE ut.user_id = ?
        `,
        [userId]
      );
      return res.send({ success: true, themes });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.get("/videoIds", async (req, res) => {
  autoSignin(req, res, async () => {
    try {
      const connection = pool.promise();
      const { searchIds } = req.query;

      const isValidSearchIds = validateString(searchIds, "search ids", 200);

      if (!isValidSearchIds.isValid) {
        return res.send({ success: false, reason: isValidSearchIds.reason });
      }

      const [info] = await connection.query(
        "SELECT video_id, name, id FROM themes WHERE id IN (?)",
        [searchIds.split(",")]
      );
      return res.send({ success: true, info });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.post("/create", async (req, res) => {
  autoSignin(req, res, async () => {
    try {
      const userId = req.session.user_id;
      const { name, tags, description, url } = req.body;

      const isValidName = validateString(name, "theme name", 40);

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      const isValidDescription = validateString(
        description,
        "theme description",
        500
      );

      if (!isValidDescription.isValid) {
        return res.send({ success: false, reason: isValidDescription.reason });
      }

      const isValidURL = validateURL(url);

      if (!isValidURL.isValid) {
        return res.send({ success: false, reason: isValidURL.reason });
      }

      const videoId = new URLSearchParams(new URL(isValidURL.url).search).get(
        "v"
      );
      if (!videoId)
        return res.send({ success: false, reason: "Invalid Youtube link" });
      const connection = pool.promise();
      const theme_id = generateRandomId(10);
      const themeInfo = {
        theme_id,
        name,
        description,
        video_id: videoId,
        tags: tags.join(","),
        user_id: userId,
      };
      connection.query(`INSERT INTO themes SET ?`, themeInfo);
      res.send({
        success: true,
        msg: "New theme uploaded!",
        themeInfo: { ...themeInfo, likes: "" },
      });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

Router.post("/like/:id", async (req, res) => {
  autoSignin(req, res, async () => {
    const themeId = req.params.id;
    const userId = req.session.user_id;
    const { liked } = req.body;

    const isValidLiked = validateBoolean(liked, "liked", true);

    if (!isValidLiked.isValid) {
      return res.send({ success: false, reason: isValidLiked.reason });
    }

    const isValidThemeId = validateStrictString(themeId, "theme id");

    if (!isValidThemeId.isValid) {
      return res.send({ success: false, reason: isValidThemeId.reason });
    }

    try {
      const connection = pool.promise();
      if (liked) {
        /* const [[{ verified }]] = await connection.query(`SELECT verified FROM users WHERE user_id = ?`, [userId]);
        if (!verified) {
          //return res.send({ success: false, reason: "Please verify your email" });
        } */
        const [update] = await connection.query(
          `UPDATE themes 
          SET likes = CASE 
            WHEN likes = '' THEN ?
            ELSE CONCAT(likes, ',', ?) 
            END WHERE id = ?`,
          [userId, userId, themeId]
        );
        mainIo.emit(`liked:${themeId}`, userId);
      } else {
        const [update] = await connection.query(
          `UPDATE themes 
          SET likes = 
            TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likes, ','), ',${userId},', ','))
            WHERE id = ?`,
          [themeId]
        );
        mainIo.emit(`unliked:${themeId}`, userId);
      }
      res.send({ success: true });
    } catch (err) {
      console.error("Error performing database queries:", err);
      res.status(500).send({ success: false, reason: "An error occurred" });
    }
  });
});

Router.post("/save", async (req, res) => {
  autoSignin(req, res, async () => {
    try {
      const userId = req.session.user_id;
      const { themeId, category } = req.body;

      const isValidCategory = validateInteger(category, "category", 10, -1);

      if (!isValidCategory.isValid) {
        return res.send({ success: false, reason: isValidCategory.reason });
      }

      const isValidThemeId = validateStrictString(themeId, "theme id");

      if (!isValidThemeId.isValid) {
        return res.send({ success: false, reason: isValidThemeId.reason });
      }

      const themeInfo = `${category}:${themeId}`;
      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        `SELECT themes from users WHERE user_id = ?`,
        [userId]
      );

      const themes = userInfo.themes === "" ? [] : userInfo.themes.split(",");
      const oldThemeIndex = themes.findIndex((theme) =>
        theme.includes(themeId)
      );
      if (oldThemeIndex !== -1) {
        themes.splice(oldThemeIndex, 1);
      }
      themes.push(themeInfo);
      await connection.query(`UPDATE users SET themes = ? WHERE user_id = ?`, [
        themes.join(","),
        userId,
      ]);

      const weekDay = DateTime.now().weekday - 1;
      redisClient.zIncrBy(`theme:${themeId}:weekUsage`, 1, weekDay.toString());
      mainIo.emit(`used:${themeId}`);
      res.send({ success: true, msg: "Theme Saved" });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

Router.post("/unsave", async (req, res) => {
  autoSignin(req, res, async () => {
    try {
      const userId = req.session.user_id;
      const { themeId } = req.body;

      const isValidThemeId = validateStrictString(themeId, "theme id");

      if (!isValidThemeId.isValid) {
        return res.send({ success: false, reason: isValidThemeId.reason });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        `SELECT themes from users WHERE user_id = ?`,
        [userId]
      );

      const themes = userInfo.themes === "" ? [] : userInfo.themes.split(",");
      const oldThemeIndex = themes.findIndex((theme) =>
        theme.includes(themeId)
      );
      if (oldThemeIndex !== -1) {
        themes.splice(oldThemeIndex, 1);
        const weekDay = DateTime.now().weekday - 1;
        redisClient.zIncrBy(
          `theme:${themeId}:weekUsage`,
          -1,
          weekDay.toString()
        );
        mainIo.emit(`unused:${themeId}`);
      }
      await connection.query(`UPDATE users SET themes = ? WHERE user_id = ?`, [
        themes.join(","),
        userId,
      ]);

      res.send({ success: true, msg: "Theme Unsaved" });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

module.exports = Router;

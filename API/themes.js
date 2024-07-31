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
  validateArray,
} = require("../Utils/validate");
const { mainIo } = require("../sockets/mainIo");

Router.get("/", async (req, res) => {
  try {
    const connection = pool.promise();
    const [themes] = await connection.query(`
      SELECT 
      t.theme_id, 
      t.video_id, 
      t.name, 
      t.description, 
      t.tags,
      GROUP_CONCAT(DISTINCT tl.user_id) AS likes
      FROM themes t
      LEFT JOIN theme_likes tl ON tl.theme_id = t.theme_id
      GROUP BY t.theme_id
    `);

    themes.map((theme) => {
      theme.weekUsage = 0;
      theme.tags = theme.tags === "" ? [] : theme.tags.split(",");
      theme.likes = !theme.likes ? [] : theme.likes.split(",");
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
    }

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
        SELECT t.theme_id, t.video_id, t.name, t.description, t.tags, ut.category_id
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

Router.put("/theme", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
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

      const isValidTags = validateArray(tags, "tags", 10);

      if (!isValidTags.isValid) {
        return res.send({ success: false, reason: isValidTags.reason });
      }

      const isValidURL = validateURL(url);

      if (!isValidURL.isValid) {
        return res.send({ success: false, reason: isValidURL.reason });
      }

      const video_id = new URLSearchParams(new URL(isValidURL.url).search).get(
        "v"
      );
      if (!video_id)
        return res.send({ success: false, reason: "Invalid Youtube link" });
      const connection = pool.promise();
      const theme_id = generateRandomId(10);
      const themeInfo = {
        theme_id,
        name,
        description,
        video_id,
        tags: tags.join(","),
        user_id: userId,
      };
      connection.query(`INSERT INTO themes SET ?`, themeInfo);
      res.send({
        success: true,
        msg: "New theme uploaded!",
        newTheme: { ...themeInfo, likes: [] },
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
        const newLike = {
          user_id: userId,
          theme_id: themeId,
        };

        await connection.query(`INSERT INTO theme_likes SET ?`, newLike);

        mainIo.emit(`liked:${themeId}`, userId);
      } else {
        await connection.query(
          `DELETE FROM theme_likes WHERE user_id = ? AND theme_id = ?`,
          [userId, themeId]
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

Router.post("/theme/save", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { themeId, categoryId, categoryName } = req.body;

      const isValidCategoryId = validateInteger(categoryId, "category", 10, -1);

      if (!isValidCategoryId.isValid) {
        return res.send({ success: false, reason: isValidCategoryId.reason });
      }

      const isValidThemeId = validateStrictString(themeId, "theme id");

      if (!isValidThemeId.isValid) {
        return res.send({ success: false, reason: isValidThemeId.reason });
      }

      const newUserTheme = {
        user_id: userId,
        theme_id: themeId,
        category_id: categoryId,
      };

      const connection = pool.promise();

      await connection.query(
        `DELETE FROM user_themes WHERE user_id = ? AND theme_id = ?`,
        [userId, themeId]
      );

      if (categoryId !== -1) {
        connection.query(`INSERT INTO user_themes SET ?`, newUserTheme);
        return res.send({ success: true, msg: `Theme saved to ${categoryName}` });
      }

      return res.send({ success: true, msg: `Theme unsaved` });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

module.exports = Router;

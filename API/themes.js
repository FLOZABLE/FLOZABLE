const express = require("express");
const Router = express.Router();
const redisClient = require("../model/redis");
const { generateRandomId } = require("../Utils/tool");
const pool = require("../model/pool");
const {
  validateStrictString,
  validateString,
  validateBoolean,
  validateInteger,
  validateURL,
  validateArray,
} = require("../Utils/validate");
const { mainIo } = require("../sockets/io");
const { autoSignin } = require("./auth");
const { RESPONSE_CODES } = require("../Constant");

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

    if (!themes.length) {
      return res.send({ success: true, status: "success", data: { themes } });
    }

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

    return res.send({ success: true, status: "success", data: { themes } });
  } catch (err) {
    console.log(err);
    res.send(RESPONSE_CODES.error);
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
      return res.send({ success: true, status: "success", data: { themes } });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

Router.put("/theme", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, tags, description, url } = req.body;

      const isValidName = validateString(name, "theme name", 40);

      if (!isValidName.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidName.reason,
          error: { reason: isValidName.reason },
        });
      }

      const isValidDescription = validateString(
        description,
        "theme description",
        500
      );

      if (!isValidDescription.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidDescription.reason,
          error: { reason: isValidDescription.reason },
        });
      }

      const isValidTags = validateArray(tags, "tags", 10);

      if (!isValidTags.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidTags.reason,
          error: { reason: isValidTags.reason },
        });
      }

      const isValidURL = validateURL(url);

      if (!isValidURL.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidURL.reason,
          error: { reason: isValidURL.reason },
        });
      }

      const video_id = new URLSearchParams(new URL(isValidURL.url).search).get(
        "v"
      );
      if (!video_id) {
        return res.send({
          success: false,
          status: "error",
          message: "Invalid Youtube link",
          error: { reason: "Invalid Youtube link" },
        });
      }

      const connection = pool.promise();
      const theme_id = generateRandomId(10);
      const themeInfo = {
        theme_id,
        name,
        description,
        video_id,
        tags,
        user_id: userId,
      };
      const insertInfo = { ...themeInfo, tags: tags.toString() };
      await connection.query(`INSERT INTO themes SET ?`, [insertInfo]);

      res.send({
        success: true,
        status: "success",
        message: "New theme uploaded!",
        data: { theme: { ...themeInfo, likes: [] } },
      });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

Router.post("/theme/like", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { theme_id: themeId, like } = req.body;

      const isValidlike = validateBoolean(like, "like", true);

      if (!isValidlike.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidlike.reason,
          error: { reason: isValidlike.reason },
        });
      }

      const isValidThemeId = validateStrictString(themeId, "theme id");

      if (!isValidThemeId.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidThemeId.reason,
          error: { reason: isValidThemeId.reason },
        });
      }

      const connection = pool.promise();

      if (like) {
        const newLike = {
          user_id: userId,
          theme_id: themeId,
        };

        await connection.query(`INSERT INTO theme_likes SET ?`, newLike);

        mainIo.emit(`like:theme:${themeId}`, userId);
      } else {
        await connection.query(
          `DELETE FROM theme_likes WHERE user_id = ? AND theme_id = ?`,
          [userId, themeId]
        );

        mainIo.emit(`unlike:theme:${themeId}`, userId);
      }

      res.send({ success: true, status: "success" });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

Router.post("/theme/save", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const {
        theme_id: themeId,
        category_id: categoryId,
        category_name: categoryName,
      } = req.body;

      const isValidCategoryId = validateInteger(categoryId, "category", 10, -1);

      if (!isValidCategoryId.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidCategoryId.reason,
          error: { reason: isValidCategoryId.reason },
        });
      }

      const isValidThemeId = validateStrictString(themeId, "theme id");

      if (!isValidThemeId.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidThemeId.reason,
          error: { reason: isValidThemeId.reason },
        });
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
        return res.send({
          success: true,
          status: "success",
          message: `Theme saved to ${categoryName}`,
        });
      }

      return res.send({
        success: true,
        status: "success",
        message: `Theme unsaved`,
      });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

module.exports = Router;

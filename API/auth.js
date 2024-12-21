const express = require("express");
const Router = express.Router();
const crypto = require("crypto");
const { DateTime } = require("luxon");
const fetch = require("node-fetch");
const querystring = require("node:querystring");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { hashing, generateRandomId, isValidTimeZone } = require("../utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
} = require("../utils/validate");
const {
  cacheUserInfo,
  setGoogleAccessToken,
  appTokenCache,
  getDeviceToken,
} = require("../services/redisLoader");
const { sendEmail } = require("../email");
const { USER_ID_COOKIE_OPTIONS, REDIS_EXP } = require("../Constant");
const { google } = require("googleapis");
const RESPONSE_MESSAGES = require("../utils/responses");

async function autoSignin(
  req,
  res,
  success = () => {},
  fail = () => {
    const response = RESPONSE_MESSAGES.noSession();
    return res.status(response.status).send(response);
  }
) {
  try {
    if (process.env.NODE_ENV === "development") {
      req.session.user_id = process.env.TESTER_ID;
      return success(process.env.TESTER_ID);
    }

    if (req.session.user_id) {
      return success(req.session.user_id);
    }

    if (req.signedCookies.userId) {
      req.session.user_id = req.signedCookies.userId;
      return success(req.signedCookies.userId);
    }

    const authHeader = req.headers.authorization;
    const userId = req.headers["user-id"];
    const deviceId = req.headers["device-id"];

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") ||
      !userId ||
      !deviceId
    ) {
      return fail();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return fail();

    const savedToken = await getDeviceToken(userId, deviceId);
    if (savedToken !== token) return fail(); // Token mismatch

    success(userId);
  } catch (err) {
    console.log(err);
    return fail();
  }
}

async function createAccount(name, email, timezone, userInfo) {
  try {
    if (!isValidTimeZone(timezone)) {
      timezone = "UTC";
    }
    const userDateTime = DateTime.now().setZone(timezone);
    // Set the time to 12:00 AM
    const twelveAmDateTime = userDateTime.set({ millisecond: 0 });
    // Get the Unix timestamp in seconds
    const created_at = twelveAmDateTime.toSeconds();
    // Sanitize inputs
    //check email
    const isValidEmail = validateEmail(email);
    if (!isValidEmail.isValid) {
      return {
        success: false,
        status: 400,
        message: isValidEmail.reason,
        error: { reason: isValidEmail.reason },
      };
    }

    const isValidName = validateStrictString(name, "Name", 25, 1);
    if (!isValidName.isValid) {
      return {
        success: false,
        status: 400,
        message: isValidName.reason,
        error: { reason: isValidName.reason },
      };
    }
    const connection = pool.promise();

    const [[checkEmail]] = await connection.query(
      "SELECT email FROM users WHERE email = ?",
      email
    );

    if (checkEmail) {
      return {
        success: false,
        status: 400,
        message: "Email already in use",
        error: { reason: "Email already in use" },
      };
    }

    const user_id = generateRandomId(10);
    const key_salt = crypto.randomBytes(32).toString("hex");
    const iv = crypto.randomBytes(16).toString("hex");
    const user = {
      name,
      email,
      user_id,
      timezone,
      created_at,
      key_salt,
      iv,
      ...userInfo,
    };

    await connection.query("INSERT INTO users SET ?", user);
    user.groups = [];
    user.friends = [];

    cacheUserInfo(user);
    //create default subject
    const subject_id = generateRandomId(10);
    const suvject_created_at = Math.floor(new Date().getTime() / 1000);
    const subject = {
      subject_id,
      name: "others",
      user_id,
      icon: "others",
      color: "#000000",
      created_at: suvject_created_at,
    };
    connection.query(`INSERT INTO subjects SET ?`, subject);

    return {
      success: true,
      status: 200,
      message: "Account Created!",
      data: { user_id },
    };
  } catch (err) {
    console.log(err);
  }
}

function googleOauth2client(credential) {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    if (credential) {
      auth.setCredentials(credential);
    }
    return auth;
  } catch (err) {
    console.log(err);
    return false;
  }
}

Router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const isValidEmail = validateEmail(email);
    if (!isValidEmail.isValid) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: isValidEmail.reason,
        error: { reason: isValidEmail.reason },
      });
    }

    const connection = pool.promise();

    const [[userInfo]] = await connection.query(
      "SELECT user_id, salt, hashed_password, email, name, timezone, hashed_password FROM users WHERE email = ?",
      email
    );

    if (!userInfo) {
      const response = RESPONSE_MESSAGES.noUser();
      return res.status(response.status).send(response);
    }

    const hashedPassword = crypto
      .pbkdf2Sync(password, userInfo.salt, 99097, 32, "sha512")
      .toString("hex");

    if (hashedPassword !== userInfo.hashed_password) {
      const response = RESPONSE_MESSAGES.wrongPassword();
      return res.status(response.status).send(response);
    }

    // Generate a new session ID
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      req.session.user_id = userInfo.user_id;

      res.cookie("userId", userInfo.user_id, USER_ID_COOKIE_OPTIONS);

      res.status(200).send({ success: true, status: 200, message: "Success!" });
    });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.get("/signin/google", async (req, res) => {
  try {
    const { code } = req.query;
    const state = req.query.state ? decodeURIComponent(req.query.state) : "{}";
    let timezone = "UTC";

    const auth = googleOauth2client();
    const response = await auth.getToken(code);
    if (response.res.status !== 200) {
      console.log("err");
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
    const connection = pool.promise();
    const { refresh_token, access_token, expiry_date } = response.tokens;

    try {
      const parsedState = JSON.parse(state);
      if (
        parsedState &&
        parsedState.timezone &&
        isValidTimeZone(parsedState.timezone)
      ) {
        timezone = parsedState.timezone;
        console.log("timezone:", timezone);
      }
    } catch (err) {
      console.error("Error parsing state or validating timezone: ", err);
    }

    await autoSignin(
      req,
      res,
      async (userId) => {
        setGoogleAccessToken(userId, access_token, expiry_date);

        connection.query(
          `UPDATE users SET google_refresh_token = ? WHERE user_id = ?`,
          [refresh_token, userId]
        );

        res.redirect(process.env.NEXT_SERVER + "/dashboard/account");
      },
      async () => {
        //if not logged in = create acc
        auth.setCredentials(response.tokens);
        const oauth2 = google.oauth2({
          auth,
          version: "v2",
        });
        const userInfoResponse = await oauth2.userinfo.get();
        const data = userInfoResponse.data;
        data.name = data.name.replace(/ /g, "");

        const { name, email } = data;

        const [[userInfo]] = await connection.query(
          `SELECT user_id FROM users WHERE email = ?`,
          [email]
        );

        if (!userInfo) {
          //new user
          const accountResponse = await createAccount(name, email, timezone);

          const { success, data } = accountResponse;

          if (!success) {
            return res.redirect(process.env.NEXT_SERVER + "/dashboard/account");
          }

          const { user_id } = data;

          req.session.regenerate((err) => {
            if (err) {
              console.log("Error regenerating session ID:", err);
              const response = RESPONSE_MESSAGES.error();
              return res.status(response.status).send(response);
            }

            req.session.user_id = user_id;
          });

          res.cookie("userId", user_id, USER_ID_COOKIE_OPTIONS);

          setGoogleAccessToken(user_id, access_token, expiry_date);

          connection.query(
            `UPDATE users SET google_refresh_token = ? WHERE user_id = ?`,
            [refresh_token, user_id]
          );

          return res.redirect(
            process.env.NEXT_SERVER + "/dashboard?welcome=true"
          );
        }

        const { user_id } = userInfo;

        req.session.regenerate((err) => {
          if (err) {
            console.log("Error regenerating session ID:", err);
            const response = RESPONSE_MESSAGES.error();
            return res.status(response.status).send(response);
            return;
          }

          req.session.user_id = user_id;
        });

        res.cookie("userId", user_id, USER_ID_COOKIE_OPTIONS);

        setGoogleAccessToken(user_id, access_token, expiry_date);

        connection.query(
          `UPDATE users SET google_refresh_token = ? WHERE user_id = ?`,
          [refresh_token, user_id]
        );

        return res.redirect(process.env.NEXT_SERVER + "/dashboard/account");
      }
    );
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.get("/signin/spotify", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const state = generateRandomId(10);

      const redirect_uri = process.env.SERVER + "/auth/signin/spotify/callback";
      const client_id = process.env.SPOTIFY_CLIENT_ID;
      const scope = "playlist-read-private";

      //prevents csrf
      await redisClient.setex(`user:${userId}:spotifyState`, 10 * 60, state);

      res.redirect(
        "https://accounts.spotify.com/authorize?" +
          querystring.stringify({
            response_type: "code",
            client_id,
            scope,
            redirect_uri,
            state: `${userId}:${state}`,
          })
      );
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/signin/spotify/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!req.query.state) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({ success: false, message: "State mismatch" })
      );
    }

    const [userId, state] = req.query.state.split(":");

    if (!state || !userId) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({ success: false, message: "State mismatch" })
      );
    }

    const storedState = await redisClient.get(`user:${userId}:spotifyState`);

    if (storedState !== state) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({ success: false, message: "State mismatch" })
      );
    }

    const redirect_uri = process.env.SERVER + "/auth/signin/spotify/callback";
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    const body = querystring.stringify({
      code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${client_id}:${client_secret}`
        ).toString("base64")}`,
      },
      body,
    });

    const data = await response.json();

    if (data.error) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({
            success: false,
            message: data.error_description,
          })
      );
    }

    const { refresh_token, access_token, expires_in } = data;

    if (refresh_token) {
      const connection = pool.promise();

      await connection.query(
        `UPDATE users SET spotify_refresh_token = ? WHERE user_id = ?`,
        [refresh_token, userId]
      );
    }
    if (access_token) {
      redisClient.setex(
        `user:${userId}:spotifyAccessToken`,
        expires_in,
        access_token
      );
    }

    return res.redirect(
      `${process.env.NEXT_SERVER}/dashboard/account?` +
        querystring.stringify({ success: true, message: "Success!" })
    );
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.post("/app/signin", async (req, res) => {
  try {
    const {
      email,
      password,
      device_id: deviceId,
      brand,
      device_name: deviceName,
    } = req.body;

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: isValidEmail.reason,
        error: { reason: isValidEmail.reason },
      });
    }

    if (!password) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: "Password Missing",
        error: { reason: "Password Missing" },
      });
    }

    if (!deviceId) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: "Device id Missing",
        error: { reason: "Device id Missing" },
      });
    }

    const connection = pool.promise();

    const [[userInfo]] = await connection.query(
      "SELECT user_id, salt, hashed_password, email, hashed_password FROM users WHERE email = ?",
      email
    );

    if (!userInfo) {
      const response = RESPONSE_MESSAGES.noUser();
      return res.status(response.status).send(response);
    }

    const hashedPassword = crypto
      .pbkdf2Sync(password, userInfo.salt, 99097, 32, "sha512")
      .toString("hex");

    if (hashedPassword !== userInfo.hashed_password) {
      const response = RESPONSE_MESSAGES.wrongPassword();
      return res.status(response.status).send(response);
    }

    const token = generateRandomId(20);

    const now = DateTime.now().toSeconds();

    const newDevice = {
      device_id: deviceId,
      user_id: userInfo.user_id,
      created_at: now,
      name: deviceName,
      brand,
      token,
    };

    await connection.query(
      "DELETE FROM devices WHERE device_id = ? AND user_id = ?",
      [deviceId, userInfo.user_id]
    );
    await redisClient.del(
      `user:${userInfo.user_id}:device:${deviceId}:auth_token`
    );

    connection.query("INSERT INTO devices SET ?", [newDevice]);

    redisClient.setex(
      `user:${userInfo.user_id}:device:${deviceId}:auth_token`,
      REDIS_EXP.APP_AUTH,
      token
    );

    req.session.user_id = userInfo.user_id;
    console.log(token, "token");
    return res.status(200).send({
      success: true,
      status: 200,
      message: "Authed",
      data: {
        token,
        user_id: userInfo.user_id,
      },
    });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

//for native app
Router.post("/app/signin/google", async (req, res) => {
  try {
    const {
      code,
      device_id: deviceId,
      brand,
      device_name: deviceName,
    } = req.body;

    if (!deviceId) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: "Device id Missing",
        error: { reason: "Device id Missing" },
      });
    }

    const auth = googleOauth2client();
    const response = await auth.getToken(code);

    if (response.res.status !== 200) {
      console.log("err");
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }

    const timezone = isValidTimeZone(req.body.timezone)
      ? req.body.timezone
      : "UTC";

    const now = DateTime.now().toSeconds();
    const token = generateRandomId(20);

    const device = {
      device_id: deviceId,
      user_id: null,
      created_at: now,
      name: deviceName,
      brand,
      token,
    };

    const connection = pool.promise();
    const { refresh_token, access_token, expiry_date } = response.tokens;

    console.log("code", code);

    //if not logged in = create acc
    auth.setCredentials(response.tokens);
    const oauth2 = google.oauth2({
      auth,
      version: "v2",
    });
    const userInfoResponse = await oauth2.userinfo.get();
    const data = userInfoResponse.data;
    data.name = data.name.replace(/ /g, "");

    const { name, email } = data;

    const [[userInfo]] = await connection.query(
      `SELECT user_id FROM users WHERE email = ?`,
      [email]
    );

    let userId = userInfo?.user_id;

    if (!userInfo) {
      //new user
      const accountResponse = await createAccount(name, email, timezone);

      const { success, data } = accountResponse;

      if (!success) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      userId = data.user_id;
    }

    device.user_id = userId;

    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      req.session.user_id = userId;
    });

    res.cookie("userId", userId, USER_ID_COOKIE_OPTIONS);

    setGoogleAccessToken(userId, access_token, expiry_date);

    await connection.query(
      `
      UPDATE users SET google_refresh_token = ? WHERE user_id = ?;
      DELETE FROM devices WHERE device_id = ? AND user_id = ?
    `,
      [refresh_token, userId, deviceId, userId]
    );

    console.log(deviceId, userId);

    await redisClient.del(`user:${userId}:device:${deviceId}:auth_token`);

    connection.query("INSERT INTO devices SET ?", [device]);

    redisClient.setex(
      `user:${userId}:device:${deviceId}:auth_token`,
      REDIS_EXP.APP_AUTH,
      token
    );

    return res.status(200).send({
      success: true,
      status: 200,
      message: "Authed",
      data: {
        token,
        user_id: userId,
      },
    });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.post("/app/signup", async (req, res) => {
  try {
    const {
      email,
      name,
      password,
      timezone,
      device_id: deviceId,
      brand,
      device_name: deviceName,
    } = req.body;

    const isValidPassword = validatePassword(password, 30);

    if (!isValidPassword.isValid) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: isValidPassword.reason,
        error: { reason: isValidPassword.reason },
      });
    }

    if (!deviceId) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: "Device id Missing",
        error: { reason: "Device id Missing" },
      });
    }

    const [salt, hashed_password] = hashing(password);

    const response = await createAccount(name, email, timezone, {
      salt,
      hashed_password,
    });

    const { success, data } = response;

    if (!success) {
      return res.status(400).send(response);
    }

    const { user_id } = data;

    const now = DateTime.now().toSeconds();
    const token = generateRandomId(20);

    const device = {
      device_id: deviceId,
      user_id,
      created_at: now,
      name: deviceName,
      brand,
      token,
    };

    const connection = pool.promise();
    await connection.query(
      `
      DELETE FROM devices WHERE device_id = ? AND user_id = ?
    `,
      [deviceId, user_id]
    );

    console.log(deviceId, user_id);

    await redisClient.del(`user:${user_id}:device:${deviceId}:auth_token`);

    connection.query("INSERT INTO devices SET ?", [device]);

    redisClient.setex(
      `user:${user_id}:device:${deviceId}:auth_token`,
      REDIS_EXP.APP_AUTH,
      token
    );

    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }
      req.session.user_id = user_id;
    });

    res.cookie("userId", user_id, USER_ID_COOKIE_OPTIONS);

    res.status(200).send({
      success: true,
      status: 200,
      message: "Account Created!",
      data: { token, user_id },
    });
  } catch (err) {
    console.log(err);
  }
});

Router.post("/verify/token", async (req, res) => {
  try {
    const { device_id: deviceId, token } = req.body;

    const isValidDeviceId = validateStrictString(deviceId, "user id", 32, 5);

    if (!isValidDeviceId.isValid) {
      const response = RESPONSE_MESSAGES.validationError(isValidDeviceId);
      return res.status(response.status).send(response);
    }

    const isValidToken = validateStrictString(token, "token", 20, 20);

    if (!isValidToken.isValid) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: isValidToken.reason,
        error: { reason: isValidToken.reason },
      });
    }

    const connection = pool.promise();
    const [[device]] = await connection.query(
      `SELECT user_id, created_at FROM devices WHERE device_id = ? AND token = ?`,
      [deviceId, token]
    );
    console.log(device);

    if (!device) {
      const response = RESPONSE_MESSAGES.notAuthed();
      return res.status(response.status).send(response);
    }

    req.session.user_id = device.user_id;

    return res
      .status(200)
      .send({ success: true, status: 200, data: { device } });
  } catch (err) {
    console.log(err);
  }
});

Router.post("/verify", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        `SELECT email FROM users WHERE user_id = ?`,
        [userId]
      );

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const { email } = userInfo;

      const verifyId = generateRandomId(10);
      redisClient.setex(
        `verify:${userId}`,
        REDIS_EXP.VERIFY_EMAIL,
        `${verifyId}:${email}:`
      );
      const params = {
        verifyURL: `${process.env.SERVER}/auth/verify?user_id=${userId}&verify_id=${verifyId}`,
      };
      const to = [{ email }];
      const response = await sendEmail(to, params, 5);

      console.log(response);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/verify", async (req, res) => {
  try {
    const { user_id, verify_id } = req.query;

    if (!user_id || !verify_id) {
      return res.redirect(
        process.env.NEXT_SERVER +
          "/dashboard?" +
          querystring.stringify(RESPONSE_MESSAGES.expiredRequest())
      );
    }

    const verifyInfo = await redisClient.get(`verify:${user_id}`);

    if (!verifyInfo) {
      return res.redirect(
        process.env.NEXT_SERVER +
          "/dashboard?" +
          querystring.stringify(RESPONSE_MESSAGES.expiredRequest())
      );
    }
    const [storedVerifyId, email] = verifyInfo.split(":");

    if (storedVerifyId !== verify_id) {
      return res.redirect(
        process.env.NEXT_SERVER +
          "/dashboard?" +
          querystring.stringify(RESPONSE_MESSAGES.expiredRequest())
      );
    }

    const connection = pool.promise();

    const newUserInfo = {
      email,
      verified: 1,
    };

    await connection.query(`UPDATE users SET ? WHERE user_id = ?`, [
      newUserInfo,
      user_id,
    ]);

    redisClient.del(`verify:${user_id}`);

    return res.redirect(
      process.env.NEXT_SERVER +
        "/dashboard?" +
        querystring.stringify({ success: true, message: "Email Verified" })
    );
  } catch (err) {
    console.log(err);
    return res.redirect(
      process.env.NEXT_SERVER +
        "/dashboard?" +
        querystring.stringify(RESPONSE_MESSAGES.expiredRequest())
    );
  }
});

Router.post("/signup", async (req, res) => {
  try {
    const { email, name, password, timezone } = req.body;

    const isValidPassword = validatePassword(password, 30);

    if (!isValidPassword.isValid) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: isValidPassword.reason,
        error: { reason: isValidPassword.reason },
      });
    }

    const [salt, hashed_password] = hashing(password);

    const response = await createAccount(name, email, timezone, {
      salt,
      hashed_password,
    });

    const { success, data } = response;

    if (!success) {
      return res.status(400).send(response);
    }

    const { user_id } = data;

    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }
      req.session.user_id = user_id;
    });

    res.cookie("userId", user_id, USER_ID_COOKIE_OPTIONS);

    res.status(200).send({
      success: true,
      status: 200,
      message: "Account Created!",
    });
  } catch (err) {
    console.log(err);
  }
});

Router.get("/logout", function (req, res) {
  try {
    console.log("logout");
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
      }
      res.clearCookie("userId");
      res.status(200).send({ success: true, status: 200 });
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = { Router, googleOauth2client, autoSignin };

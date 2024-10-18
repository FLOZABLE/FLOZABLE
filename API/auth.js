const express = require("express");
const Router = express.Router();
const crypto = require("crypto");
const { DateTime } = require("luxon");
const fetch = require("node-fetch");
const querystring = require("node:querystring");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { hashing, generateRandomId, isValidTimeZone } = require("../Utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
} = require("../Utils/validate");
const {
  cacheUserInfo,
  setGoogleAccessToken,
  appTokenCache,
} = require("../services/redisLoader");
const { sendEmail } = require("../email");
const {
  USER_ID_COOKIE_OPTIONS,
  RESPONSE_CODES,
  REDIS_EXP,
} = require("../Constant");
const { google } = require("googleapis");

async function autoSignin(
  req,
  res,
  success = () => {},
  fail = () => {
    res.send(RESPONSE_CODES["no-user"]);
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

    if (!authHeader || !authHeader.startsWith("Bearer ") || !userId) {
      return fail();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return fail();

    const savedToken = await appTokenCache(userId, false);
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
      return { success: false, reason: isValidEmail.reason };
    }
    const isValidName = validateStrictString(name, "Name", 25, 1);
    if (!isValidName.isValid) {
      return { success: false, reason: isValidName.reason };
    }
    const connection = pool.promise();
    const [[checkEmail]] = await connection.query(
      "SELECT email FROM users WHERE email = ?",
      email
    );
    if (checkEmail) {
      return { success: false, reason: "EMAIL ALREADY IN USE" };
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

    return { success: true, user_id };
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
  const { email, password } = req.body;

  const isValidEmail = validateEmail(email);
  if (!isValidEmail.isValid) {
    return res.send({ success: false, reason: isValidEmail.reason });
  }

  const connection = pool.promise();

  const [[userInfo]] = await connection.query(
    "SELECT user_id, salt, hashed_password, email, name, timezone, hashed_password FROM users WHERE email = ?",
    email
  );

  if (!userInfo) {
    return res.send({ success: false, reason: "NO SUCH USER" });
  }

  const hashedPassword = crypto
    .pbkdf2Sync(password, userInfo.salt, 99097, 32, "sha512")
    .toString("hex");

  if (hashedPassword === userInfo.hashed_password) {
    const userId = userInfo.user_id;

    // Generate a new session ID
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        res.send({ success: false, reason: "SESSION ERROR" });
        return;
      }

      req.session.user_id = userId;

      res.cookie("userId", userId, USER_ID_COOKIE_OPTIONS);

      res.send({ success: true, msg: "Success" });
    });
  } else {
    res.send({ success: false, reason: "WRONG PASSWORD" });
  }
});

Router.get("/signin/google", async (req, res) => {
  try {
    const { code } = req.query;
    const state = decodeURIComponent(req.query.state);

    const auth = googleOauth2client();
    const response = await auth.getToken(code);
    if (response.res.status !== 200) {
      return res.send(RESPONSE_CODES["error"]);
    }
    const connection = pool.promise();
    const { refresh_token, access_token, expiry_date } = response.tokens;

    console.log("gddd", state);

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
        console.log("gddd");
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
          const accountResponse = await createAccount(
            name,
            email,
            state?.timezone
          );

          const { success, user_id } = accountResponse;

          if (!success) {
            return res.redirect(process.env.NEXT_SERVER + "/dashboard/account");
          }

          req.session.regenerate((err) => {
            if (err) {
              console.log("Error regenerating session ID:", err);
              res.send({ success: false, reason: "SESSION ERROR" });
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

          return res.redirect(
            process.env.NEXT_SERVER + "/dashboard?welcome=true"
          );
        }

        const { user_id } = userInfo;

        req.session.regenerate((err) => {
          if (err) {
            console.log("Error regenerating session ID:", err);
            res.send({ success: false, reason: "SESSION ERROR" });
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
    res.send(RESPONSE_CODES["error"]);
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
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.get("/signin/spotify/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!req.query.state) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({ success: false, reason: "State mismatch" })
      );
    }

    const [userId, state] = req.query.state.split(":");

    if (!state || !userId) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({ success: false, reason: "State mismatch" })
      );
    }

    const storedState = await redisClient.get(`user:${userId}:spotifyState`);

    if (storedState !== state) {
      return res.redirect(
        `${process.env.NEXT_SERVER}/dashboard/account?` +
          querystring.stringify({ success: false, reason: "State mismatch" })
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
            reason: data.error_description,
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
        querystring.stringify({ success: true, msg: "Success!" })
    );
  } catch (err) {
    console.log(err);
    res.send(RESPONSE_CODES["error"]);
  }
});

Router.post("/app/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const connection = pool.promise();

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    }

    if (!password)
      return res.send({ success: false, reason: "Password Missing" });

    const [[userInfo]] = await connection.query(
      "SELECT user_id, salt, hashed_password, email, hashed_password FROM users WHERE email = ?",
      email
    );

    if (!userInfo) {
      return res.send(RESPONSE_CODES["no-user"]);
    }

    const hashedPassword = crypto
      .pbkdf2Sync(password, userInfo.salt, 99097, 32, "sha512")
      .toString("hex");

    if (hashedPassword !== userInfo.hashed_password) {
      return res.send({ success: false, reason: "WRONG PASSWORD" });
    }

    const token = await appTokenCache(userInfo.user_id, true);
    req.session.user_id = userInfo.user_id;
    const deviceId = generateRandomId(10);
    console.log(token);
    return res.send({
      success: true,
      msg: "Authed",
      token,
      deviceId,
      userId: userInfo.user_id,
    });
  } catch (err) {
    console.log(err);
  }
});

Router.post("/app/validate-tokens", async (req, res) => {
  try {
    const { userId, token } = req.body;

    const isValidDeviceId = validateStrictString(userId, "user id", 10, 10);

    if (!isValidDeviceId.isValid) {
      return res.send({ success: false, reason: isValidDeviceId.reason });
    }

    const isValidToken = validateStrictString(token, "token", 20, 20);

    if (!isValidToken.isValid) {
      return res.send({ success: false, reason: isValidToken.reason });
    }

    const savedToken = await appTokenCache(userId, false);
    console.log("token", savedToken, token, userId);
    if (savedToken !== token) {
      return res.send(RESPONSE_CODES["not-authenticated"]);
    }

    req.session.user_id = userId;

    return res.send({ success: true });
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
        return res.send(RESPONSE_CODES["no-user"]);
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
      sendEmail(to, params, 5);
      res.send({ success: true, msg: "Check your email!" });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
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
          querystring.stringify(RESPONSE_CODES["expired-request"])
      );
    }

    const verifyInfo = await redisClient.get(`verify:${user_id}`);

    if (!verifyInfo) {
      return res.redirect(
        process.env.NEXT_SERVER +
          "/dashboard?" +
          querystring.stringify(RESPONSE_CODES["expired-request"])
      );
    }
    const [storedVerifyId, email] = verifyInfo.split(":");

    if (storedVerifyId !== verify_id) {
      return res.redirect(
        process.env.NEXT_SERVER +
          "/dashboard?" +
          querystring.stringify(RESPONSE_CODES["expired-request"])
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
        querystring.stringify({ success: true, msg: "Email Verified" })
    );
  } catch (err) {
    console.log(err);
    return res.redirect(
      process.env.NEXT_SERVER +
        "/dashboard?" +
        querystring.stringify(RESPONSE_CODES["expired-request"])
    );
  }
});

Router.post("/signup", async (req, res) => {
  try {
    const { email, name, password, timeZone } = req.body;

    const isValidPassword = validatePassword(password, 30);

    if (!isValidPassword.isValid) {
      return res.send({ success: false, reason: isValidPassword.reason });
    }

    const [salt, hashed_password] = hashing(password);

    const response = await createAccount(name, email, timeZone, {
      salt,
      hashed_password,
    });

    const { success, user_id } = response;

    if (!success) {
      return res.send(response);
    }

    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        res.send({ success: false, reason: "SESSION ERROR" });
        return;
      }
      req.session.user_id = user_id;
    });

    res.cookie("userId", user_id, USER_ID_COOKIE_OPTIONS);

    res.send({ success: true, msg: "Login to Your Account!" });
  } catch (err) {
    console.log(err);
  }
});

Router.get("/logout", function (req, res) {
  console.log("logout");
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.clearCookie("userId");
    //res.redirect('/');
    res.send({ success: true });
  });
});

module.exports = { Router, googleOauth2client, autoSignin };

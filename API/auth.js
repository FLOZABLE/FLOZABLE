const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const { DateTime } = require("luxon");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const querystring = require("node:querystring");

const {
  hashing,
  autoSignin,
  generateRandomId,
  googleOauth2client,
  isValidTimeZone,
} = require("../Utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
  validateString,
  validateLength,
} = require("../Utils/validate");
const {
  userCache,
  cacheUserInfo,
  setGoogleAccessToken,
} = require("../services/redisLoader");
const { sendEmail } = require("../email");
const { USER_ID_COOKIE_OPTIONS, RESPONSE_CODES } = require("../Constant");
const fetch = require("node-fetch");
const { request } = require("request");

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
    const isValidName = validateStrictString(name, "Name");
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

    const customer = await stripe.customers.create({
      name,
      email,
    });

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
      stripe_id: customer.id,
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

    const authId = generateRandomId(10);
    await redisClient.setex(`extension:auth:${authId}`, 10, user_id);

    return { success: true, user_id };
  } catch (err) {
    console.log(err);
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
    const { code, state } = req.query;

    const auth = googleOauth2client();
    const response = await auth.getToken(code);
    if (response.res.status !== 200) {
      return res.send(RESPONSE_CODES["error"]);
    }
    const connection = pool.promise();
    const { refresh_token, access_token, expiry_date } = response.tokens;

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
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
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
      await redisClient.setex(`user:${userId}:spotifyState`, 10, state);

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

      await connection.query(`UPDATE users SET spotify_refresh_token = ?`, [
        refresh_token,
      ]);
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

Router.post("/link", async (req, res) => {
  const { verifyId } = req.body;
  autoSignin(req, res, async (userId) => {
    try {
      const email = await userCache(userId);
      const verifyInfo = await redisClient.get(`verify:${email.email}`);
      if (!verifyInfo) {
        return res.send({ success: false, reason: "Link expired" });
      }
      if (verifyId === verifyInfo) {
        const connection = pool.promise();
        await connection.query(
          "UPDATE users SET verified = true WHERE user_id = ?",
          [userId]
        );
        await redisClient.del(`verify:${email.email}`);
        res.send({ success: true, msg: "Verification Success!" });
      } else {
        res.send({ success: false, reason: "Incorrect Data" });
      }
    } catch (err) {
      console.log(err);
      RESPONSE_CODES["error"];
    }
  });
});

Router.post("/link/send", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const userInfo = await userCache(userId);
      const randomId = generateRandomId(10);
      await redisClient.setex(`verify:${userInfo.email}`, 3600, randomId);
      const params = {
        resetURL: `${process.env.EMAIL_SERVER}/account/verify-by-link?verifyId=${randomId}`,
      };
      const to = [{ email: userInfo.email }];
      sendEmail(to, params, 4);

      res.send({ success: true, msg: "Link Sent To Email!" });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Error" });
    }
  });
});

Router.post("/app", async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    const connection = pool.promise();

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    }

    if (!password)
      return res.send({ success: false, reason: "Password Missing" });

    if (!deviceInfo || typeof deviceInfo !== "object")
      return res.send({ success: false, reason: "Device Info Missing" });

    const [[userInfo]] = await connection.query(
      "SELECT user_id, salt, hashed_password, email, hashed_password FROM users WHERE email = ?",
      email
    );

    if (!userInfo) {
      return res.send({ success: false, reason: "NO SUCH USER" });
    }

    const hashedPassword = crypto
      .pbkdf2Sync(password, userInfo.salt, 99097, 32, "sha512")
      .toString("hex");

    if (hashedPassword !== userInfo.hashed_password) {
      return res.send({ success: false, reason: "WRONG PASSWORD" });
    }

    const { brand, deviceName } = deviceInfo;

    const isValidBrand = validateString(brand ? brand : "", "brand", 30);

    if (!isValidBrand.isValid) {
      return res.send({ success: false, reason: isValidBrand.reason });
    }

    const isValidDeviceName = validateLength(
      deviceName ? deviceName : "",
      "device name",
      30
    );

    if (!isValidDeviceName.isValid) {
      return res.send({ success: false, reason: isValidDeviceName.reason });
    }

    const device_id = deviceInfo.deviceId
      ? deviceInfo.deviceId
      : generateRandomId(10);

    const isValidDeviceId = validateStrictString(
      device_id,
      "device id",
      10,
      10
    );
    if (!isValidDeviceId.isValid) {
      return res.send({ success: false, reason: isValidDeviceId.reason });
    }

    const auth_key = generateRandomId(20);
    const last_auth = DateTime.now().set({ second: 0 }).toSeconds();
    const insertInfo = {
      device_id,
      last_auth,
      name: deviceName,
      brand,
      auth_key,
      user_id: userInfo.user_id,
    };

    await connection.query(
      `DELETE FROM devices WHERE device_id = ? AND user_id = ?`,
      [device_id, userInfo.user_id]
    );
    connection.query(`INSERT INTO devices SET ?`, insertInfo);

    req.session.user_id = userInfo.user_id;

    return res.send({ success: true, msg: "Authed", device_id, auth_key });
  } catch (err) {
    console.log(err);
  }
});

Router.post("/app/validate-tokens", async (req, res) => {
  try {
    const { deviceId, authKey } = req.body;

    const isValidDeviceId = validateStrictString(deviceId, "device id", 10, 10);

    if (!isValidDeviceId.isValid) {
      return res.send({ success: false, reason: isValidDeviceId.reason });
    }

    const isValidAuthKey = validateStrictString(authKey, "auth key", 20, 20);

    if (!isValidAuthKey.isValid) {
      return res.send({ success: false, reason: isValidAuthKey.reason });
    }

    const connection = pool.promise();

    const [[device]] = await connection.query(
      `SELECT user_id FROM devices WHERE device_id = ? AND auth_key = ?`,
      [deviceId, authKey]
    );

    if (!device) {
      return res.send({ successs: false, reason: "Invalid Token" });
    }

    req.session.user_id = device.user_id;

    return res.send({ success: true });
  } catch (err) {
    console.log(err);
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

module.exports = Router;

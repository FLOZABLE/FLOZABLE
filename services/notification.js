const crypto = require("crypto");
const { DateTime } = require("luxon");
const {} = require("../services/redisLoader");
const webpush = require("web-push");
const { RESPONSE_CODES } = require("../Constant");
const schedule = require("node-schedule");
const redisClient = require("../model/redis");

async function updateVapidKeys() {
  try {
    const vapidKeys = webpush.generateVAPIDKeys();
    redisClient.hset(
      `vapidKeys`,
      "public",
      vapidKeys.publicKey,
      "private",
      vapidKeys.privateKey
    );
    console.log("updated vapid keys:", vapidKeys);
    return vapidKeys;
  } catch (err) {
    console.log(err);
  }
}

(async () => {
  try {
    const [publicKey, privateKey] = await redisClient.hmget(
      `vapidKeys`,
      "public",
      "private"
    );

    if (publicKey && privateKey) {
      return webpush.setVapidDetails(
        "mailto: support@flozable.com",
        publicKey,
        privateKey
      );
    }

    const newVapidKeys = await updateVapidKeys();
    if (newVapidKeys) {
      webpush.setVapidDetails(
        "mailto: support@flozable.com",
        newVapidKeys.publicKey,
        newVapidKeys.privateKey
      );
    }
  } catch (err) {
    console.log(err);
  }
})();

async function planPushNotification(
  connection,
  userId,
  notificationId,
  notificationTime,
  payload
) {
  try {
    const [[userInfo]] = await connection.query(
      `SELECT key_salt, iv, notification_endpoint, notification_keys FROM users WHERE user_id = ?`,
      [userId]
    );

    if (!userInfo) {
      return RESPONSE_CODES["no-user"];
    }

    const { notification_endpoint, notification_keys, iv, key_salt } = userInfo;

    if (!notification_endpoint || !notification_keys) {
      return { success: false, reason: "Permission denied" };
    }

    const encryptKey = await deriveKey(userId, key_salt);
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(encryptKey, "hex"),
      Buffer.from(iv, "hex")
    );
    const decryptedEndPoint =
      decipher.update(notification_endpoint, "base64", "utf8") +
      decipher.final("utf8");

    console.log(decryptedEndPoint);
    const credentials = {
      endpoint: decryptedEndPoint,
      keys: JSON.parse(notification_keys),
    };

    schedule.scheduleJob(
      notificationId,
      DateTime.fromSeconds(notificationTime).toJSDate(),
      () => {
        sendPushNotification(credentials, payload);
      }
    );
  } catch (err) {
    console.log(err);
  }
}

function sendPushNotification(credentials, payload) {
  webpush
    .sendNotification(credentials, payload)
    .then((response) => {
      // Handle successful response
      console.log("Push notification sent successfully:", response);
    })
    .catch((err) => {
      console.error("Error sending push notification:", err);
    });
}

const NOTIFICATION_PAYLOADS = {
  plan: ({ title, start, end, plan_id, timezone }) => {
    const startDateTime = DateTime.fromSeconds(start, {
      zone: timezone,
    }).toFormat("h:mm a");
    const endDateTime = DateTime.fromSeconds(end, { zone: timezone }).toFormat(
      "h:mm a"
    );
    const body = `${startDateTime} - ${endDateTime}`;
    return JSON.stringify({
      title,
      body,
      icon: "https://flozable.com/favicon.ico",
      actions: [
        { action: "viewplan", title: "View plan" },
        { action: "close", title: "Close" },
      ],
      data: {
        link: `${process.env.NEXT_SERVER}/dashboard/planner?plan=${plan_id}`,
      },
    });
  },
};

module.exports = {
  NOTIFICATION_PAYLOADS,
  planPushNotification,
  updateVapidKeys,
};

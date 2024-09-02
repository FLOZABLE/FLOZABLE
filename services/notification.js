const crypto = require("crypto");
const { DateTime } = require("luxon");
const {
  subjectsTimelineCache,
  websiteUsageCache,
} = require("../services/redisLoader");
const { timelineSort } = require("../Utils/timelineSorting");
const { hex2rgb, secondConverter, deriveKey } = require("../Utils/tool");
const webpush = require("web-push");
const QuickChart = require("quickchart-js");
const { colorsList, RESPONSE_CODES } = require("../Constant");
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

async function planPushNotification(connection, userId) {
  try {
    const [[userInfo]] = await connection.query(
      `SELECT key_salt, iv, notification_endpoint, notification_keys FROM users WHERE user_id = ?`,
      [userId]
    );

    if (!userInfo) return RESPONSE_CODES["error"];

    console.log(userInfo);
  } catch (err) {
    console.log(err);
  }
  /* const { user_id, key_salt, iv, notification_endpoint, notification_keys } = userInfo;

  console.log(notification_endpoint)
  try {
    const encryptKey = await deriveKey(user_id, key_salt);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(iv, 'hex'));
    let decryptedEndPoint = decipher.update(notification_endpoint, 'base64', 'utf8');

    decryptedEndPoint += decipher.final('utf8');

    const credentials = {
      endpoint: decryptedEndPoint,
      keys: JSON.parse(notification_keys)
    };

    sendPushNotification(credentials, payload);
    if (startTime === -1) {
      sendPushNotification(credentials, payload);
      return;
    };

    schedule.scheduleJob(notificationId, DateTime.fromSeconds(startTime).toJSDate(), () => {
      sendPushNotification(credentials, payload);
    });
  } catch (err) {
    console.log(err);
  } */
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

async function dailyReport(userId, timezone) {
  const subjects = await subjectsTimelineCache(userId);
  const websiteUsage = await websiteUsageCache(userId);
  console.log(websiteUsage, subjects);

  const sortedSubjects = timelineSort(subjects);
  const subjectsDatasets = sortedSubjects.map((subject) => {
    const [total] = subject.daily.total.slice(-1);
    const { r, g, b } = hex2rgb(subject.color);
    return { name: subject.name, color: `rgb(${r}, ${g}, ${b})`, total };
  });

  const dailyTrend = subjects.daily.groupedTotal.slice(-7);
  const now = DateTime.now().setZone(timezone);
  const dailyTrendLabels = [];
  for (let i = 0; i < dailyTrend.length; i++) {
    dailyTrendLabels.push(now.minus({ day: i }).toFormat("M/d"));
  }

  dailyTrendLabels.reverse();

  const dailyTrendConfig = {
    type: "line",
    data: {
      labels: dailyTrendLabels,
      datasets: [
        {
          label: "Time",
          data: dailyTrend,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              callback: (sec) => {
                let value = sec ? sec : 0;
                let type = "s";
                if (sec >= 60 * 60) {
                  value = (sec / (60 * 60)).toFixed(2);
                  type = "h";
                } else if (sec > 60) {
                  value = Math.floor(sec / 60);
                  type = "m";
                }

                return value + type;
              },
            },
          },
        ],
      },
    },
  };

  const subjectsConfig = {
    type: "pie",
    data: {
      datasets: [
        {
          data: subjectsDatasets.map((subject) => {
            return subject.total;
          }),
          backgroundColor: subjectsDatasets.map((subject) => {
            return subject.color;
          }),
        },
      ],
      labels: subjectsDatasets.map((subject) => {
        return subject.name;
      }),
    },
    options: {
      legend: {
        display: true,
      },
      scales: {
        xAxes: [
          {
            display: false,
          },
        ],
        yAxes: [],
      },
      plugins: {
        datalabels: {
          display: false,
        },
      },
    },
  };

  const websitesConfig = {
    type: "pie",
    data: {
      datasets: [
        {
          data: websiteUsage.map((website) => {
            return website.t;
          }),
          backgroundColor: colorsList,
        },
      ],
      labels: websiteUsage.map((website) => {
        return website.d;
      }),
    },
    options: {
      legend: {
        display: true,
      },
      scales: {
        xAxes: [
          {
            display: false,
          },
        ],
        yAxes: [],
      },
      plugins: {
        datalabels: {
          display: false,
        },
      },
    },
  };
  /* const dailyTrendChart = new QuickChart();
  dailyTrendChart.setConfig(dailyTrendChartConfig);

  console.log(dailyTrendChart.getUrl) */
  /* const subjectsURL = "https://quickchart.io/chart?c=" + JSON.stringify(subjectsPie);
  const dailyTrendURL = "https://quickchart.io/chart?c=" + JSON.stringify(dailyTrendChart); */

  const subjectPieChart = new QuickChart();
  subjectPieChart.setConfig(subjectsConfig);

  const dailyTrendChart = new QuickChart();
  dailyTrendChart.setConfig(dailyTrendConfig);

  const websiteChart = new QuickChart();
  websiteChart.setConfig(websitesConfig);
  websiteChart.setBackgroundColor("transparent");

  /* console.log(subjectPieChart.getUrl())
  console.log(dailyTrendChart.getUrl()) */
  //console.log(websiteChart.getUrl())
}

function weeklyReport() {}

module.exports = { dailyReport, planPushNotification, updateVapidKeys };

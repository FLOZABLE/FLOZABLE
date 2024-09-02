import config from "@/app/utils/config";

async function getVapidKeys() {
  const response = await fetch(`${config.server}/notifications/vapidkeys`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function postNotificationsSubscribe({ endpoint, keys }) {
  const response = await fetch(`${config.server}/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ endpoint, keys }),
  });
  const data = await response.json();

  return data;
}

async function postNotificationsRead(notificationId) {
  const response = await fetch(`${config.server}/notifications/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ notificationId }),
  });
  const data = await response.json();

  return data;
}

export { getVapidKeys, postNotificationsSubscribe, postNotificationsRead };

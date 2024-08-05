import config from "@/app/utils/config";

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

export { postNotificationsRead };

import AxiosInstance from "@/app/utils/axiosInstance";

async function getVapidKeys() {
  const response = await AxiosInstance.get(`/notifications/vapidkeys`);
  return response.data;
}

async function postNotificationsSubscribe({ endpoint, keys }) {
  const response = await AxiosInstance.get(`/notifications/subscribe`, {
    params: { endpoint, keys },
  });
  return response.data;
}

async function postNotificationsRead(notificationId) {
  const response = await AxiosInstance.get(`/notifications/read`, {
    notification_id: notificationId,
  });
  return response.data;
}

export { getVapidKeys, postNotificationsSubscribe, postNotificationsRead };

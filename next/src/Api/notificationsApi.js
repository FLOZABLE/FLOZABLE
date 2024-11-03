import AxiosInstance from "@/app/utils/axiosInstance";
import { requestHandler } from "@/app/utils/Tool";

async function getNotifications() {
  return requestHandler(AxiosInstance.get(`/notifications`));
}

async function getVapidKeys() {
  return requestHandler(AxiosInstance.get(`/notifications/vapidkeys`));
}

async function postNotificationsSubscribe({ endpoint, keys }) {
  return requestHandler(
    AxiosInstance.get(`/notifications/subscribe`, {
      params: { endpoint, keys },
    })
  );
}

async function postNotificationsRead(notificationId) {
  return requestHandler(
    AxiosInstance.get(`/notifications/read`, {
      notification_id: notificationId,
    })
  );
}

export {
  getNotifications,
  getVapidKeys,
  postNotificationsSubscribe,
  postNotificationsRead,
};

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getVapidKeys } from "@/Api/notificationsApi";

function useNotifications() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ["useNotifications"],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 60,
    select: (response) => response?.data?.notifications || [],
    placeholderData: [],
  });

  const { data: notifications } = queryResult;

  const updateNotificationsData = async (newData) => {
    await queryClient.setQueryData(["useNotifications"], (oldData) => {
      if (!oldData) return newData;
      return typeof newData === "function"
        ? newData(oldData)
        : { ...oldData, ...newData };
    });
  };

  const filterNotification = (notificationId) => {
    updateNotificationsData((prev) => {
      if (!prev?.data?.notifications) return prev;

      const updatedNotifications = prev.data.notifications.filter(
        (notification) => notification.notification_id !== notificationId
      );

      return {
        ...prev,
        data: {
          ...prev.data,
          notifications: updatedNotifications,
        },
      };
    });
  };

  return {
    notifications,
    updateNotificationsData,
    filterNotification,
    ...queryResult,
  };
}

function useVapidKeys() {
  const queryResult = useQuery({
    queryKey: [`vapidKeys`],
    queryFn: getVapidKeys,
    staleTime: 1000 * 60 * 60,
  });

  const { data: vapidKeysData } = queryResult;

  return {
    vapidKeysData,
    ...queryResult,
  };
}

export { useNotifications, useVapidKeys };

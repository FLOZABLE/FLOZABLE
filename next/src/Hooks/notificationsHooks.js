import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getVapidKeys } from "@/Api/notificationsApi";
import { useCallback } from "react";
import { updateQueryData } from "@/app/utils/Tool";

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

  const updateNotificationsData = useCallback(async (newData) => {
    await queryClient.setQueryData(["useNotifications"], (oldData) => {
      return updateQueryData(oldData, newData, "notifications");
    });
  }, []);

  const filterNotification = useCallback((notificationId) => {
    updateNotificationsData((prev) => {
      return prev.filter(
        (notification) => notification.notification_id !== notificationId
      );
    });
  }, []);

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

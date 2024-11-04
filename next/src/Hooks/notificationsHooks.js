import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getVapidKeys } from "@/Api/notificationsApi";

function useNotifications() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useNotifications`],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 60,
    select: (response) => response?.data?.notifications || [],
    placeholderData: [],
  });

  const { data: notifications } = queryResult;

  const updateNotificationsData = (newData) => {
    queryClient.setQueryData(["useNotifications"], (oldData) => {
      if (!oldData) return newData;
      // Optionally merge old and new data here if only partial updates are needed
      return typeof newData === "function" ? newData(oldData) : newData;
    });
  };

  return {
    notifications,
    updateNotificationsData,
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

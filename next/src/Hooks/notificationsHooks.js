import { useQuery } from "@tanstack/react-query";
import { getNotifications, getVapidKeys } from "@/Api/notificationsApi";

function useNotifications() {
  const queryResult = useQuery({
    queryKey: [`useNotifications`],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 60,
  });

  const { data: notificationsData } = queryResult;

  return {
    notificationsData,
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

import { useQuery } from "@tanstack/react-query";
import { getVapidKeys } from "@/Api/notificationsApi";

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

export { useVapidKeys };

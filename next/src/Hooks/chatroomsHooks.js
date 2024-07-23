import { getChatrooms } from "@/Api/chatroomsApi";
import { useQuery } from "@tanstack/react-query";

function useGetChatrooms(userInfo) {
  return useQuery({
    queryKey: [`useGetChatrooms`],
    queryFn: getChatrooms,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useGetChatrooms };

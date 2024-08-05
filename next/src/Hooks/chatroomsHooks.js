import { getChatMembers, getChatRooms } from "@/Api/chatApi";
import { useQuery } from "@tanstack/react-query";

function useGetChatrooms(userInfo) {
  return useQuery({
    queryKey: [`useGetChatrooms`],
    queryFn: getChatRooms,
    staleTime: 1000 * 5,
    enabled: !!userInfo,
  });
}

function useGetChatroomMembers(chatroomId) {
  return useQuery({
    queryKey: [`useGetChatroomMembers`, chatroomId],
    queryFn: () => getChatMembers(chatroomId),
    staleTime: 1000 * 60,
    enabled: !!chatroomId,
  });
}

export { useGetChatrooms, useGetChatroomMembers };

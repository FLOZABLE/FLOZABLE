import { getChatMembers, getChatRooms } from "@/Api/chatApi";
import { useQuery } from "@tanstack/react-query";

function useChatRooms(userInfo) {
  return useQuery({
    queryKey: [`useChatRooms`],
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

export { useChatRooms, useGetChatroomMembers };

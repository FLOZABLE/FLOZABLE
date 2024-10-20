import { getChatMembers, getChatRooms } from "@/Api/chatApi";
import { useQuery } from "@tanstack/react-query";

function useChatRooms(userInfo) {
  const queryResult = useQuery({
    queryKey: [`useChatRooms`],
    queryFn: getChatRooms,
    staleTime: 1000 * 5,
    enabled: !!userInfo,
  });

  const { data: chatRoomsData, refetch: chatRoomsRefetch } = queryResult;

  return { chatRoomsData, chatRoomsRefetch, ...queryResult };
}

function useChatroomMembers(chatroomId) {
  const queryResult = useQuery({
    queryKey: [`useChatroomMembers`, chatroomId],
    queryFn: () => getChatMembers(chatroomId),
    staleTime: 1000 * 60 * 10,
    enabled: !!chatroomId,
  });

  const { data: chatroomMembersData, refetch: chatroomMembersRefetch } =
    queryResult;

  return { chatroomMembersData, chatroomMembersRefetch, ...queryResult };
}

export { useChatRooms, useChatroomMembers };

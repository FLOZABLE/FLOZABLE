import { getChatMembers, getChatMessages, getChatRooms } from "@/Api/chatApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";

function useChatRooms() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`useChatRooms`],
    queryFn: getChatRooms,
    staleTime: 1000 * 5,
    enabled: !!userInfo,
  });

  const { data: chatRoomsData, refetch: chatRoomsRefetch } = queryResult;

  return { chatRoomsData, chatRoomsRefetch, ...queryResult };
}

function useChatMessages({ chatroomId, offset, length, lastMsgId }) {
  const queryResult = useInfiniteQuery({
    queryKey: [`useChatMessages`, chatroomId, offset, length],
    queryFn: () => getChatMessages({ chatroomId, offset, length, lastMsgId }),
    staleTime: 1000 * 60 * 10,
    enabled: !!chatroomId,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage =
        lastPage.length === 30 ? allPages.length * 30 : undefined;
      return nextPage;
    },
  });

  const { data: chatMessagesData, refetch: chatMessagesRefetch } = queryResult;

  // Custom effect to refetch when `lastMsgId` changes if necessary
  useEffect(() => {
    if (lastMsgId) {
      chatMessagesRefetch(); // Manually refetch only when lastMsgId changes
    }
  }, [lastMsgId]);

  return { chatMessagesData, chatMessagesRefetch, ...queryResult };
}

function useChatRoomMembers(chatroomId) {
  const queryResult = useQuery({
    queryKey: [`useChatRoomMembers`, chatroomId],
    queryFn: () => getChatMembers(chatroomId),
    staleTime: 1000 * 60 * 10,
    enabled: !!chatroomId,
  });

  const { data: chatroomMembersData, refetch: chatroomMembersRefetch } =
    queryResult;

  return { chatroomMembersData, chatroomMembersRefetch, ...queryResult };
}

export { useChatRooms, useChatMessages, useChatRoomMembers };

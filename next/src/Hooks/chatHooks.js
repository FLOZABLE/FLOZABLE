import { getChatMembers, getChatMessages, getChatRooms } from "@/Api/chatApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useContext } from "react";

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

function useChatMessages({ chatroomId, length, lastMsgId }) {
  const queryResult = useInfiniteQuery({
    queryKey: [`useChatMessages`, chatroomId, length, lastMsgId],
    queryFn: ({ pageParam }) =>
      getChatMessages({ chatroomId, pageParam, length }),
    staleTime: 1000 * 60 * 10,
    enabled: !!chatroomId,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage =
        lastPage?.data?.messages.length === length
          ? allPages.length * length
          : undefined;
      return nextPage;
    },
  });

  const { data: chatMessagesData, refetch: chatMessagesRefetch } = queryResult;

  /* // Refetch when lastMsgId changes
  useEffect(() => {
    if (lastMsgId) {
      chatMessagesRefetch();
    }
  }, [lastMsgId]); */

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

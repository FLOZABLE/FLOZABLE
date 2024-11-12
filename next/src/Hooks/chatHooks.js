import { getChatMembers, getChatMessages, getChatRooms } from "@/Api/chatApi";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccount } from "./accountHooks";
import { useCallback } from "react";
import { updateQueryData } from "@/app/utils/Tool";

function useChatRooms() {
  const { accountData } = useAccount();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useChatRooms`],
    queryFn: getChatRooms,
    staleTime: 1000 * 5,
    enabled: !!accountData,
    select: (response) => response?.data?.chatrooms || [],
    placeholderData: [],
  });

  const { data: chatrooms, refetch: chatRoomsRefetch } = queryResult;

  const updateChatrooms = useCallback(async (newData) => {
    await queryClient.setQueryData(["useChatRooms"], (oldData) => {
      return updateQueryData(oldData, newData, "chatrooms");
    });
  }, []);

  return { chatrooms, chatRoomsRefetch, updateChatrooms, ...queryResult };
}

function useChatMessages({ chatroomId, length, lastMsgId }) {
  const queryResult = useInfiniteQuery({
    queryKey: [`useChatMessages`, chatroomId, length, lastMsgId],
    queryFn: ({ pageParam }) =>
      getChatMessages({ chatroomId, pageParam, length }),
    staleTime: 1000 * 60 * 10,
    enabled: !!chatroomId,
    initialPageParam: 0,
    select: (response) => response?.data?.messages || [],
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

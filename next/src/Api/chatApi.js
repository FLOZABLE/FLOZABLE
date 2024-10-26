import AxiosInstance from "@/app/utils/axiosInstance";

async function getChatRooms() {
  const response = await AxiosInstance.get(`/chat/rooms`);
  return response.data;
}

async function getChatMessages({ chatroomId, pageParam, length }) {
  const response = await AxiosInstance.get(`/chat/messages`, {
    params: {
      chatroom_id: chatroomId,
      offset: pageParam,
      length,
    },
  });
  return response.data;
}

async function getChatMembers(chatroomId) {
  const response = await AxiosInstance.get(`/chat/members`, {
    params: {
      chatroom_id: chatroomId,
    },
  });
  return response.data;
}

async function postChatRequest(targetId) {
  const response = await AxiosInstance.post(`/chat/request`, {
    targetId,
  });
  return response.data;
}

async function postChatRequestReply({ targetId, accepted, notificationId }) {
  const response = await AxiosInstance.post(`/chat/request/reply`, {
    targetId,
    accepted,
    notificationId,
  });
  return response.data;
}

export {
  getChatRooms,
  getChatMembers,
  getChatMessages,
  postChatRequest,
  postChatRequestReply,
};

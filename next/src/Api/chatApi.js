import AxiosInstance from "@/app/utils/axiosInstance";
import { requestHandler } from "@/app/utils/Tool";

async function getChatRooms() {
  return requestHandler(AxiosInstance.get(`/chat/rooms`));
}

async function getChatMessages({ chatroomId, pageParam, length }) {
  return requestHandler(
    AxiosInstance.get(`/chat/messages`, {
      params: {
        chatroom_id: chatroomId,
        offset: pageParam,
        length,
      },
    })
  );
}

async function getChatMembers(chatroomId) {
  return requestHandler(
    AxiosInstance.get(`/chat/members`, {
      params: {
        chatroom_id: chatroomId,
      },
    })
  );
}

async function postChatRequest(targetId) {
  return requestHandler(
    AxiosInstance.post(`/chat/request`, {
      target_id: targetId,
    })
  );
}

async function postChatRequestReply({ accepted, notificationId }) {
  return requestHandler(
    AxiosInstance.post(`/chat/request/reply`, {
      notification_id: notificationId,
      accepted,
    })
  );
}

export {
  getChatRooms,
  getChatMembers,
  getChatMessages,
  postChatRequest,
  postChatRequestReply,
};

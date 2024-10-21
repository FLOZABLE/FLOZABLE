import config from "@/app/utils/config";
import queryString from "query-string";

async function getChatRooms() {
  const response = await fetch(`${config.server}/chat/rooms`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function getChatMessages({ chatroomId, offset, length, lastMsgId }) {
  const response = await fetch(
    `${config.server}/chat/messages?${queryString.stringify({
      chatroom_id: chatroomId,
      offset,
      length,
      lastMsgId,
    })}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
}

async function getChatMembers(chatroomId) {
  const response = await fetch(
    `${config.server}/chat/members?chatroom_id=${chatroomId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
}

async function postChatRequest(targetId) {
  const response = await fetch(`${config.server}/chat/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ targetId }),
  });
  const data = await response.json();

  return data;
}

async function postChatRequestReply({ targetId, accepted, notificationId }) {
  const response = await fetch(`${config.server}/chat/request/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ targetId, accepted, notificationId }),
  });
  const data = await response.json();

  return data;
}

export {
  getChatRooms,
  getChatMembers,
  getChatMessages,
  postChatRequest,
  postChatRequestReply,
};

import config from "@/app/utils/config";

async function getChatrooms() {
  const response = await fetch(`${config.server}/chatrooms`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function getChatroomMessages(chatroomId) {
  const response = await fetch(
    `${config.server}/chatrooms/messages?chatroom_id=${chatroomId}`,
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

async function getChatroomMembers(chatroomId) {
  const response = await fetch(
    `${config.server}/chatrooms/members?chatroom_id=${chatroomId}`,
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

export { getChatrooms, getChatroomMembers, getChatroomMessages };

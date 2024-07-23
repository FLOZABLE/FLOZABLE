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

export { getChatrooms };

import config from "@/app/utils/config";

async function getGroups() {
  const response = await fetch(`${config.server}/groups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

export { getGroups };

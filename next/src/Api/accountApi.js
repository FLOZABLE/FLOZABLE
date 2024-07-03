import config from "@/app/utils/config";

async function getAccount() {
  const response = await fetch(`${config.server}/account`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

export { getAccount };

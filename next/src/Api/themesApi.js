import config from "@/app/utils/config";

async function getThemes() {
  const response = await fetch(`${config.server}/themes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

export { getThemes };

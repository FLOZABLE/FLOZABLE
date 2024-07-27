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

async function putThemesTheme({ name, tags, description, url }) {
  const response = await fetch(`${config.server}/themes/theme`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, tags, description, url }),
  });
  const data = await response.json();
  return data;
}

export { getThemes, putThemesTheme };

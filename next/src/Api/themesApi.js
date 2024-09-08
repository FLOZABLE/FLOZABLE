import config from "@/app/utils/config";
import axios from "axios";

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

async function getThemesUser() {
  const response = await fetch(`${config.server}/themes/user`, {
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

async function postThemesThemeSave({ themeId, categoryId, categoryName }) {
  const response = await fetch(`${config.server}/themes/theme/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ themeId, categoryId, categoryName }),
  });
  const data = await response.json();
  return data;
}

async function postThemeLike({ themeId, like }) {
  const response = await axios.post(`${config.server}/themes/theme/like`, {
    themeId,
    like,
  });
  return response.data;
}

export {
  getThemes,
  getThemesUser,
  putThemesTheme,
  postThemesThemeSave,
  postThemeLike,
};

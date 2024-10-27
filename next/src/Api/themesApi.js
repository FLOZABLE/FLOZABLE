import AxiosInstance from "@/app/utils/axiosInstance";

async function getThemes() {
  const response = await AxiosInstance.get(`/themes`);
  return response.data;
}

async function getThemesUser() {
  const response = await AxiosInstance.get(`/themes/user`);
  return response.data;
}

async function putThemesTheme({ name, tags, description, url }) {
  const response = await AxiosInstance.post(`/themes`, {
    name,
    tags,
    description,
    url,
  });
  return response.data;
}

async function postThemesThemeSave({ themeId, categoryId, categoryName }) {
  const response = await AxiosInstance.post(`/themes/theme/save`, {
    theme_id: themeId,
    category_id: categoryId,
    category_name: categoryName,
  });
  return response.data;
}

async function postThemeLike({ themeId, like }) {
  const response = await AxiosInstance.get(`/themes/theme/like`, {
    theme_id: themeId,
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

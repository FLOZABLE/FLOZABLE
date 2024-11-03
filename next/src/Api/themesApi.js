import AxiosInstance from "@/app/utils/axiosInstance";
import { requestHandler } from "@/app/utils/Tool";

async function getThemes() {
  return requestHandler(AxiosInstance.get(`/themes`));
}

async function getThemesUser() {
  return requestHandler(AxiosInstance.get(`/themes/user`));
}

async function putThemesTheme({ name, tags, description, url }) {
  return requestHandler(
    AxiosInstance.put(`/themes/theme`, {
      name,
      tags,
      description,
      url,
    })
  );
}

async function postThemesThemeSave({ themeId, categoryId, categoryName }) {
  return requestHandler(
    AxiosInstance.post(`/themes/theme/save`, {
      theme_id: themeId,
      category_id: categoryId,
      category_name: categoryName,
    })
  );
}

async function postThemeLike({ themeId, like }) {
  return requestHandler(
    AxiosInstance.post(`/themes/theme/like`, {
      theme_id: themeId,
      like,
    })
  );
}

export {
  getThemes,
  getThemesUser,
  putThemesTheme,
  postThemesThemeSave,
  postThemeLike,
};

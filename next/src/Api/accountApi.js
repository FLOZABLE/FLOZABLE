import AxiosInstance from "@/app/utils/axiosInstance";
import queryString from "query-string";

async function getAccount() {
  const response = await AxiosInstance.get(`/account`);
  return response.data;
}

async function getAccountProfile(userId) {
  const response = await AxiosInstance.get(`/account/profile`, {
    params: { user_id: userId },
  });
  return response.data;
}

async function getAccountProfileSubjects(userId) {
  const response = await AxiosInstance.get(`/account/profile/subjects`, {
    params: { user_id: userId },
  });
  return response.data;
}

async function getAccountGoogle() {
  const response = await AxiosInstance.get(`/account/google`);
  return response.data;
}

async function patchAccountInfo({ name, email, confirmEmail }) {
  const response = await AxiosInstance.patch(`/account/info`, {
    name,
    email,
    confirmEmail,
  });
  return response.data;
}

async function patchAccountImage(formData) {
  const response = await AxiosInstance.patch(`/account/image`, formData);
  return response.data;
}

async function patchAccountPassword({ password, confirmPassword }) {
  const response = await AxiosInstance.patch(`/account/password`, {
    password,
    confirmPassword,
  });
  return response.data;
}

export {
  getAccount,
  getAccountProfile,
  getAccountProfileSubjects,
  getAccountGoogle,
  patchAccountInfo,
  patchAccountImage,
  patchAccountPassword,
};

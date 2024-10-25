import AxiosInstance from "@/app/utils/axiosInstance";
import config from "@/app/utils/config";
import queryString from "query-string";

async function getAccount() {
  const response = await AxiosInstance.get(`/account`);
  return response.data;
}

async function getAccountProfile(userId) {
  const response = await AxiosInstance.get(
    `/account/profile?${queryString.stringify({ user_id: userId })}`
  );
  return response.data;
}

async function getAccountProfileSubjects(userId) {
  const response = await AxiosInstance.get(
    `/account/profile/subjects?${queryString.stringify({ user_id: userId })}`
  );
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

async function patchAccountPassword({ password, confirmPassword }) {
  const response = await fetch(`${config.server}/account/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ password, confirmPassword }),
  });
  const data = await response.json();
  return data;
}

export {
  getAccount,
  getAccountProfile,
  getAccountProfileSubjects,
  getAccountGoogle,
  patchAccountInfo,
  patchAccountPassword,
};

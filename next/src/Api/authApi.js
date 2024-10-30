import AxiosInstance from "@/app/utils/axiosInstance";

async function getAuthLogout() {
  const response = await AxiosInstance.get(`/auth/logout`);
  return response.data;
}

async function postAuthVerify() {
  const response = await AxiosInstance.post(`/auth/verify`);
  return response.data;
}

async function postAuthSignin({ email, password }) {
  const response = await AxiosInstance.post(`/auth/signin`, {
    email,
    password,
  });
  return response.data;
}

async function postAuthSignup({ name, email, password, timezone }) {
  const response = await AxiosInstance.post(`/auth/signup`, {
    name,
    email,
    password,
    timezone,
  });
  return response.data;
}

export { getAuthLogout, postAuthVerify, postAuthSignin, postAuthSignup };

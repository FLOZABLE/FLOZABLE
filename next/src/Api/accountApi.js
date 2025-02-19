import AxiosInstance from "@/app/utils/axiosInstance";
import { requestHandler } from "@/app/utils/Tool";

async function getAccount() {
  return requestHandler(AxiosInstance.get(`/account`));
}

async function getAccountProfile(userId) {
  return requestHandler(
    AxiosInstance.get(`/account/profile`, {
      params: { user_id: userId },
    })
  );
}

async function getAccountProfileStatus(userId) {
  return requestHandler(
    AxiosInstance.get(`/account/profile/status`, {
      params: { user_id: userId },
    })
  );
}

async function getAccountGoogle() {
  return requestHandler(AxiosInstance.get(`/account/google`));
}

async function patchAccountInfo({ name, email, confirmEmail }) {
  return requestHandler(
    AxiosInstance.patch(`/account/info`, {
      name,
      email,
      confirmEmail,
    })
  );
}

async function patchAccountImage(formData) {
  return requestHandler(
    AxiosInstance.patch(`/account/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
}

async function patchAccountPassword({ password, confirmPassword }) {
  return requestHandler(
    AxiosInstance.patch(`/account/password`, {
      password,
      confirmPassword,
    })
  );
}

export {
  getAccount,
  getAccountProfile,
  getAccountProfileStatus,
  getAccountGoogle,
  patchAccountInfo,
  patchAccountImage,
  patchAccountPassword,
};

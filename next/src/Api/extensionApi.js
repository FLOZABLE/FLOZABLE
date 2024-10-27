import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone } from "@/app/utils/Tool";
import { DateTime } from "luxon";

async function getExtensionSettings() {
  const response = await AxiosInstance.get(`/extension/settings`);
  return response.data;
}

async function putExtensionSetting(url) {
  const response = await AxiosInstance.put(`/extension/setting`, { url });
  return response.data;
}

async function patchExtensionSetting({ website, mode, value }) {
  const response = await AxiosInstance.patch(`/extension/setting`, {
    website,
    mode,
    value,
  });
  return response.data;
}

async function getExtensionUsage(date, mode) {
  const timezone = getTimezone();

  const response = await AxiosInstance.get(`/extension/usage`, {
    params: {
      date: DateTime.fromJSDate(date).toISODate(),
      mode,
      timezone,
    },
  });
  return response.data;
}

export {
  getExtensionUsage,
  putExtensionSetting,
  patchExtensionSetting,
  getExtensionSettings,
};

import config from "@/app/utils/config";
import { DateTime } from "luxon";

async function getExtensionSettings() {
  const response = await fetch(`${config.server}/extension/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function putExtensionSetting(url) {
  const response = await fetch(`${config.server}/extension/setting`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ url }),
  });
  const data = await response.json();
  return data;
}

async function patchExtensionSetting({ website, mode, value }) {
  const response = await fetch(`${config.server}/extension/setting`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ website, mode, value }),
  });
  const data = await response.json();
  return data;
}

async function getExtensionUsage(date, mode) {
  if (!date || !mode) return { success: false };

  const response = await fetch(
    `${config.server}/extension/usage?date=${DateTime.fromJSDate(
      date
    ).toISODate()}&mode=${mode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
}

export {
  getExtensionUsage,
  putExtensionSetting,
  patchExtensionSetting,
  getExtensionSettings,
};

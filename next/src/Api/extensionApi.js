import config from "@/app/utils/config";
import { DateTime } from "luxon";

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

export { getExtensionUsage };

import config from "@/app/utils/config";
import { DateTime } from "luxon";

async function getRankingsUser(userId, mode, viewDate) {
  const viewDateTime = DateTime.fromJSDate(viewDate);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${
      config.server
    }/rankings/ranking/user?userId=${userId}&mode=${mode.toLowerCase()}&date=${viewDateTime.toISODate()}&timezone=${timezone}`,
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

export { getRankingsUser };

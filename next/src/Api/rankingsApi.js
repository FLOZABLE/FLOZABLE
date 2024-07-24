import config from "@/app/utils/config";
import { DateTime } from "luxon";

async function getRankings(mode, viewDate) {
  const viewDateTime = DateTime.fromJSDate(viewDate);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${
      config.server
    }/rankings?mode=${mode}&date=${viewDateTime.toISODate()}&timezone=${timezone}`,
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

async function getRankingsUser(userId, mode, viewDate) {
  const viewDateTime = DateTime.fromJSDate(viewDate);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${
      config.server
    }/rankings/user?userId=${userId}&mode=${mode}&date=${viewDateTime.toISODate()}&timezone=${timezone}`,
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

async function getRankingsFriends(mode) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${config.server}/rankings/friends?mode=${mode}&timezone=${timezone}`,
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

export { getRankings, getRankingsUser, getRankingsFriends };

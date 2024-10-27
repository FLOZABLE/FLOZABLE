import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone } from "@/app/utils/Tool";
import { DateTime } from "luxon";

async function getRankings(mode, viewDate) {
  const date = DateTime.fromJSDate(viewDate).toISODate();
  const timezone = getTimezone();

  const response = await AxiosInstance.get(`/rankings`, {
    params: { mode, date, timezone },
  });
  return response.data;
}

async function getRankingsUser(userId, mode, viewDate) {
  const date = DateTime.fromJSDate(viewDate).toISODate();
  const timezone = getTimezone();

  const response = await AxiosInstance.get(`/rankings/user`, {
    params: {
      mode,
      date,
      timezone,
      user_id: userId,
    },
  });
  return response.data;
}

async function getRankingsFriends(mode) {
  const timezone = getTimezone();

  const response = await AxiosInstance.get(`/rankings/friends`, {
    params: {
      mode,
      timezone,
    },
  });
  return response.data;
}

export { getRankings, getRankingsUser, getRankingsFriends };

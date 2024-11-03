import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone, requestHandler } from "@/app/utils/Tool";
import { DateTime } from "luxon";

async function getRankings(mode, viewDate) {
  const date = DateTime.fromJSDate(viewDate).toISODate();
  const timezone = getTimezone();

  return requestHandler(
    AxiosInstance.get(`/rankings`, {
      params: { mode, date, timezone },
    })
  );
}

async function getRankingsUser(userId, mode, viewDate) {
  const date = DateTime.fromJSDate(viewDate).toISODate();
  const timezone = getTimezone();

  return requestHandler(
    AxiosInstance.get(`/rankings/user`, {
      params: {
        mode,
        date,
        timezone,
        user_id: userId,
      },
    })
  );
}

async function getRankingsFriends(mode) {
  const timezone = getTimezone();

  return requestHandler(
    AxiosInstance.get(`/rankings/friends`, {
      params: {
        mode,
        timezone,
      },
    })
  );
}

export { getRankings, getRankingsUser, getRankingsFriends };

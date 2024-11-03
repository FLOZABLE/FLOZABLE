import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone, requestHandler } from "@/app/utils/Tool";

async function getFriendsRecommended() {
  return requestHandler(AxiosInstance.get(`/friends/recommended`));
}

async function getFriendsSearch(searchQuery) {
  return requestHandler(
    AxiosInstance.get(`/friends/search`, {
      params: {
        query: searchQuery,
      },
    })
  );
}

async function getFriendsTrends() {
  const timezone = getTimezone();
  return requestHandler(
    AxiosInstance.get(`/friends/trends`, {
      params: {
        timezone,
      },
    })
  );
}

async function getFriendsStatus() {
  const timezone = getTimezone();
  return requestHandler(
    AxiosInstance.get(`/friends/status`, {
      params: { timezone },
    })
  );
}

async function postFriendsRequest({ targetId }) {
  return requestHandler(
    AxiosInstance.post(`/friends/request`, {
      target_id: targetId,
    })
  );
}

async function postFriendsRequestReply({ targetId, notificationId, accepted }) {
  return requestHandler(
    AxiosInstance.post(`/friends/request/reply`, {
      target_id: targetId,
      notification_id: notificationId,
      accepted,
    })
  );
}

export {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsTrends,
  getFriendsStatus,
  postFriendsRequest,
  postFriendsRequestReply,
};

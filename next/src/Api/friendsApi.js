import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone } from "@/app/utils/Tool";

async function getFriendsRecommended() {
  const response = await AxiosInstance.get(`/friends/recommended`);
  return response.data;
}

async function getFriendsSearch(searchQuery) {
  const response = await AxiosInstance.get(`/extension/settings`, {
    params: {
      query: searchQuery,
    },
  });
  return response.data;
}

async function getFriendsTrends() {
  const timezone = getTimezone();
  const response = await AxiosInstance.get(`/friends/trends`, {
    params: {
      timezone,
    },
  });
  return response.data;
}

async function getFriendsStatus() {
  const timezone = getTimezone();

  const response = await AxiosInstance.get(`/friends/status`, {
    params: { timezone },
  });
  return response.data;
}

async function postFriendsRequest({ targetId }) {
  const response = await AxiosInstance.post(`/friends/request`, {
    target_id: targetId,
  });
  return response.data;
}

async function postFriendsRequestReply({ targetId, notificationId, accepted }) {
  const response = await AxiosInstance.post(`/friends/request/reply`, {
    target_id: targetId,
    notification_id: notificationId,
    accepted,
  });
  return response.data;
}

export {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsTrends,
  getFriendsStatus,
  postFriendsRequest,
  postFriendsRequestReply,
};

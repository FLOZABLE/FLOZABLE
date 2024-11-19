import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone, requestHandler } from "@/app/utils/Tool";

async function getFriends() {
  return requestHandler(AxiosInstance.get(`/friends`));
}

async function deleteFriend(friendId) {
  return requestHandler(
    AxiosInstance.delete(`/friends/friend`, { data: { friend_id: friendId } })
  );
}

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

async function postFriendsRequestReply({ notificationId, accepted }) {
  return requestHandler(
    AxiosInstance.post(`/friends/request/reply`, {
      notification_id: notificationId,
      accepted,
    })
  );
}

async function deleteFriendRequest(notificationId) {
  return requestHandler(
    AxiosInstance.delete(`/friends/request`, {
      data: {
        notification_id: notificationId,
      },
    })
  );
}

export {
  getFriends,
  deleteFriend,
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsTrends,
  getFriendsStatus,
  postFriendsRequest,
  postFriendsRequestReply,
  deleteFriendRequest,
};
